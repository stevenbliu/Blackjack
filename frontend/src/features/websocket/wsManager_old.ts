import { selectCurrentToken } from '@features/auth/authSlice';
import { io, Socket } from 'socket.io-client';


class EventEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, listener: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    (this.listeners[event] || []).forEach(fn => fn(...args));
  }

  removeAllListeners() {
    this.listeners = {};
  }
}

// Strongly typed events
type SocketEvents = {
  connection_state_changed: (state: ConnectionState) => void;
  error: (error: SocketError) => void;
  [key: string]: (payload: any) => void;
};

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
type SocketError = { code: string; message: string; isOperational: boolean };

interface SocketConfig {
  url: string;
  namespace?: string; // /catan, /chat, /lobby
  authToken?: string;
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  requestTimeout?: number;
  heartbeatInterval?: number;
}

interface PendingRequest<T = unknown> {
  resolve: (data: T) => void;
  reject: (reason: SocketError) => void;
  timeout: NodeJS.Timeout;
  createdAt: number;
}
// ... your imports and existing types ...

export class SocketIOManager extends EventEmitter {
  private static instance: SocketIOManager;
  private socket: Socket | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private sentMessageIds = new Set<string>();
  private messageQueues: Map<string, Array<{ message: any; retries: number }>> = new Map();
  private pendingMessages = new Map<
    string, // messageId
    { message: any; retries: number; timestamp: number; namespace: string }
  >();
  private state: ConnectionState = "disconnected";
  private lastPingTimestamp = 0;
  private heartbeatInterval?: NodeJS.Timeout;
  private config: SocketConfig;
  private currentNamespace: string = "/";
  private sockets: Map<string, Socket> = new Map();

  private constructor(config: Partial<SocketConfig> = {}) {
    super();
    this.config = {
      url: "http://localhost:8000",
      autoReconnect: true,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      requestTimeout: 20000,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  public static getInstance(config?: Partial<SocketConfig>): SocketIOManager {
    if (!SocketIOManager.instance) {
      SocketIOManager.instance = new SocketIOManager(config);
    }
    return SocketIOManager.instance;
  }

  public async connect(namespace = "/"): Promise<void> {
    if (this.sockets.has(namespace)) return;

    this.currentNamespace = namespace;

    console.log(
      "Connecting ws state " + this.state + " to " + this.config.url + namespace
    );

    if (this.state === "connected" || this.state === "connecting") {
      return;
    }
    this.setState("connecting");

    return new Promise((resolve, reject) => {
      const connectTimeout = setTimeout(() => {
        this.handleError({
          code: "CONNECTION_TIMEOUT",
          message: "Connection attempt timed out",
          isOperational: true,
        });
        reject(new Error("Connection timeout"));
      }, this.config.requestTimeout);

      const socket = io(this.config.url + namespace, {  // Connect to namespace URL
        transports: ["websocket"],
        autoConnect: true,
        reconnection: this.config.autoReconnect,
        reconnectionAttempts: this.config.reconnectAttempts,
        reconnectionDelay: this.config.reconnectDelay,
        auth: { token: this.config.authToken },
      });

      socket.on("connect", () => {
        console.log(`[WebSocket][${namespace}] ✅ Connected`);
        this.sockets.set(namespace, socket);

        clearTimeout(connectTimeout);
        this.setState("connected");

        // Flush queued messages and pending messages on connect
        this.flushMessageQueue(namespace);
        this.flushPendingMessages();

        resolve();
      });

      socket.on("disconnect", () => {
        console.log(`[WebSocket][${namespace}] ❌ Disconnected`);
        this.sockets.delete(namespace);
        this.setState("disconnected");
      });

      socket.on("connect_error", (err) => {
        this.handleError({
          code: "CONNECTION_ERROR",
          message: err.message,
          isOperational: true,
        });
        reject(err);
      });

      socket.on("message", this.handleIncomingMessage.bind(this));
      socket.on("pong", () => {
        this.lastPingTimestamp = Date.now();
      });
    });
  }

  public disconnect(namespace: string = "/"): void {
    const socket = this.sockets.get(namespace);

    if (socket) {
      socket.disconnect();
      this.sockets.delete(namespace);
    }
    this.setState("disconnected");
    this.cleanup();
  }

  public async send<T = any, R = any>(message: {
    type: string;
    payload: T;
    messageId?: string;
    timeout?: number;
    namespace?: string;
    retries?: number;
  }): Promise<R> {
    const ns = message.namespace || this.currentNamespace;
    const socket = this.sockets.get(ns);

    if (!socket?.connected) {
      if (message.messageId && !this.sentMessageIds.has(message.messageId)) {
        const queue = this.messageQueues.get(ns) || [];
        queue.push({ message, retries: message.retries ?? 0 });
        this.messageQueues.set(ns, queue);
      }
      throw {
        code: "NOT_CONNECTED",
        message: `Socket not connected (namespace: ${ns})`,
        isOperational: true,
      };
    }

    // Deduplication: If messageId was sent before, reject duplicate send
    if (message.messageId) {
      if (this.sentMessageIds.has(message.messageId)) {
        throw {
          code: "DUPLICATE_MESSAGE",
          message: "Message already sent",
          isOperational: true,
        };
      }
      this.sentMessageIds.add(message.messageId);
      this.scheduleMessageIdCleanup(message.messageId);

      // Track message in pendingMessages for delivery ACK + retry
      this.pendingMessages.set(message.messageId, {
        message,
        retries: message.retries ?? 0,
        timestamp: Date.now(),
        namespace: ns,
      });
    }

    const requestId = this.generateRequestId();

    return new Promise<R>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject({
          code: "REQUEST_TIMEOUT",
          message: "No response from server",
          isOperational: true,
        });
      }, message.timeout || this.config.requestTimeout);

      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout,
        createdAt: Date.now(),
      });

      try {
        socket.emit(
          "message",
          {
            ...message,
            requestId,
          },
          (ack: { error?: any; data?: R }) => {
            if (ack?.error) {
              reject({
                code: "SERVER_ERROR",
                message: ack.error,
                isOperational: true,
              });
            }
          }
        );
      } catch (err) {
        reject({
          code: "SEND_FAILURE",
          message: "Failed to send message",
          isOperational: false,
          originalError: err,
        });
      }
    });
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public updateAuthToken(token: string): void {
    this.config.authToken = token;
    // Update auth token for all sockets/namespaces
    this.sockets.forEach((socket) => {
      socket.auth = { token };
    });
  }

  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.emit("connection_state_changed", newState);
    }
  }

  private handleIncomingMessage(message: {
    type: string;
    payload: any;
    requestId?: string;
    messageId?: string;       // <-- ACK support
    error?: any;
  }): void {
    // Handle request responses (promise resolve/reject)
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const request = this.pendingRequests.get(message.requestId)!;
      clearTimeout(request.timeout);
      this.pendingRequests.delete(message.requestId);

      if (message.error) {
        request.reject({
          code: "SERVER_ERROR",
          message: message.error,
          isOperational: true,
        });
      } else {
        request.resolve(message.payload);
      }
      return;
    }

    // Handle explicit delivery ACK messages to clear pendingMessages queue
    if (message.type === "ack" && message.messageId && this.pendingMessages.has(message.messageId)) {
      this.pendingMessages.delete(message.messageId);
      this.sentMessageIds.delete(message.messageId);
      return; // ACK handled, no further emit needed
    }

    // Emit typed events for other message types
    this.emit(message.type, message.payload);
  }

  private flushMessageQueue(namespace: string): void {
    const queue = this.messageQueues.get(namespace);
    if (!queue || queue.length === 0) return;

    const remainingQueue: Array<{ message: any; retries: number }> = [];

    for (const { message, retries } of queue) {
      if (retries < 3) {
        this.send({ ...message, namespace, retries }).catch(() => {
          remainingQueue.push({ message, retries: retries + 1 });
        });
      }
    }

    this.messageQueues.set(namespace, remainingQueue);
  }

  private flushPendingMessages(): void {
    // Retry sending pending messages that didn't get ACK
    const now = Date.now();
    const resendLimit = this.config.requestTimeout || 20000;

    for (const [messageId, data] of this.pendingMessages.entries()) {
      const { message, retries, timestamp, namespace } = data;

      // Retry only if timeout passed and retry limit not exceeded
      if (now - timestamp > resendLimit && retries < 3) {
        this.pendingMessages.set(messageId, {
          message,
          retries: retries + 1,
          timestamp: now,
          namespace,
        });

        const socket = this.sockets.get(namespace);
        if (socket?.connected) {
          socket.emit("message", { ...message, messageId });
        }
      }

      // If retries exceed limit, remove and emit error
      if (retries >= 3) {
        this.pendingMessages.delete(messageId);
        this.sentMessageIds.delete(messageId);
        this.handleError({
          code: "DELIVERY_FAILED",
          message: `Message delivery failed after ${retries} retries: ${messageId}`,
          isOperational: true,
        });
      }
    }
  }

  private scheduleMessageIdCleanup(messageId: string): void {
    setTimeout(() => {
      this.sentMessageIds.delete(messageId);
    }, this.config.requestTimeout! * 3);
  }

  private handleError(error: SocketError): void {
    this.emit("error", error);
    console.error(`Socket Error [${error.code}]: ${error.message}`);
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanup(): void {
    this.pendingRequests.forEach((request) => {
      clearTimeout(request.timeout);
    });
    this.pendingRequests.clear();
    this.sentMessageIds.clear();
    this.messageQueues.clear();
    this.pendingMessages.clear();
    // this.cleanupHeartbeat();
  }
}

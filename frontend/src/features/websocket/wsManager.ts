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

export class SocketIOManager extends EventEmitter {
  private static instance: SocketIOManager;
  private socket: Socket | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private sentMessageIds = new Set<string>();
  private messageQueue: Array<{ message: any; retries: number }> = [];
  private state: ConnectionState = 'disconnected';
  private lastPingTimestamp = 0;
  private heartbeatInterval?: NodeJS.Timeout;
  private config: SocketConfig;

  private constructor(config: Partial<SocketConfig> = {}) {
    super();
    this.config = {
      url: 'http://localhost:8000',
      autoReconnect: true,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      requestTimeout: 20000,
      heartbeatInterval: 30000,
      ...config
    };
  }

  public static getInstance(config?: Partial<SocketConfig>): SocketIOManager {
    if (!SocketIOManager.instance) {
      SocketIOManager.instance = new SocketIOManager(config);
    }
    return SocketIOManager.instance;
  }

  public async connect(): Promise<void> {
    console.log("Connecting ws state" + this.state)

    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }
    this.setState('connecting');

    return new Promise((resolve, reject) => {
      const connectTimeout = setTimeout(() => {
        this.handleError({
          code: 'CONNECTION_TIMEOUT',
          message: 'Connection attempt timed out',
          isOperational: true
        });
        reject(new Error('Connection timeout'));
      }, this.config.requestTimeout);

      this.socket = io(this.config.url, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: this.config.autoReconnect,
        reconnectionAttempts: this.config.reconnectAttempts,
        reconnectionDelay: this.config.reconnectDelay,
        auth: {token: this.config.authToken}
      });

      this.socket.on('connect', () => {
        console.log('[WebSocket] ✅ Successfully connected to server');
        clearTimeout(connectTimeout);
        this.setState('connected');
        this.setupHeartbeat();
        this.flushMessageQueue();
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('[WebSocket] ❌ Disconnected from server');
        this.setState('disconnected');
        this.cleanupHeartbeat();
      });

      this.socket.on('connect_error', (err) => {
        this.handleError({
          code: 'CONNECTION_ERROR',
          message: err.message,
          isOperational: true
        });
        reject(err);
      });

      this.socket.on('message', this.handleIncomingMessage.bind(this));
      this.socket.on('pong', () => {
        this.lastPingTimestamp = Date.now();
      });
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.setState('disconnected');
    this.cleanup();
  }

  public async send<T = any, R = any>(message: {
    type: string;
    payload: T;
    messageId?: string;
    timeout?: number;
  }): Promise<R> {
    if (!this.socket?.connected) {
      if (message.messageId && !this.sentMessageIds.has(message.messageId)) {
        this.messageQueue.push({ message, retries: 0 });
      }
      throw {
        code: 'NOT_CONNECTED',
        message: 'Socket not connected',
        isOperational: true
      };
    }

    // Deduplication
    if (message.messageId) {
      if (this.sentMessageIds.has(message.messageId)) {
        throw {
          code: 'DUPLICATE_MESSAGE',
          message: 'Message already sent',
          isOperational: true
        };
      }
      this.sentMessageIds.add(message.messageId);
      this.scheduleMessageIdCleanup(message.messageId);
    }

    const requestId = this.generateRequestId();

    return new Promise<R>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject({
          code: 'REQUEST_TIMEOUT',
          message: 'No response from server',
          isOperational: true
        });
      }, message.timeout || this.config.requestTimeout);

      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout,
        createdAt: Date.now()
      });

      try {
        this.socket?.emit('message', {
          ...message,
          requestId
        }, (ack: { error?: any; data?: R }) => {
          if (ack?.error) {
            reject({
              code: 'SERVER_ERROR',
              message: ack.error,
              isOperational: true
            });
          }
        });
      } catch (err) {
        reject({
          code: 'SEND_FAILURE',
          message: 'Failed to send message',
          isOperational: false,
          originalError: err
        });
      }
    });
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public updateAuthToken(token: string): void {
    this.config.authToken = token;
    if (this.socket) {
      this.socket.auth = { token };
    }
  }

  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.emit('connection_state_changed', newState);
    }
  }

  private handleIncomingMessage(message: {
    type: string;
    payload: any;
    requestId?: string;
    error?: any;
  }): void {
    // Handle request responses
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const request = this.pendingRequests.get(message.requestId)!;
      clearTimeout(request.timeout);
      this.pendingRequests.delete(message.requestId);

      if (message.error) {
        request.reject({
          code: 'SERVER_ERROR',
          message: message.error,
          isOperational: true
        });
      } else {
        request.resolve(message.payload);
      }
      return;
    }

    // Emit typed events
    this.emit(message.type, message.payload);
  }

  private setupHeartbeat(): void {
    this.lastPingTimestamp = Date.now();
    this.heartbeatInterval = setInterval(() => {
      if (Date.now() - this.lastPingTimestamp > this.config.heartbeatInterval! * 1.5) {
        this.handleError({
          code: 'HEARTBEAT_FAILURE',
          message: 'Server heartbeat missed',
          isOperational: true
        });
        this.socket?.disconnect();
      } else {
        this.socket?.emit('ping');
      }
    }, this.config.heartbeatInterval);
  }

  private cleanupHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const { message, retries } = this.messageQueue.shift()!;
      if (retries < 3) {
        try {
          this.send(message).catch(() => {
            this.messageQueue.push({ message, retries: retries + 1 });
          });
        } catch {
          this.messageQueue.push({ message, retries: retries + 1 });
        }
      }
    }
  }

  private scheduleMessageIdCleanup(messageId: string): void {
    setTimeout(() => {
      this.sentMessageIds.delete(messageId);
    }, this.config.requestTimeout * 3);
  }

  private handleError(error: SocketError): void {
    this.emit('error', error);
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
    this.messageQueue = [];
    this.cleanupHeartbeat();
  }
}

// Typed event emitter interface
export interface SocketIOManager {
  on<U extends keyof SocketEvents>(event: U, listener: SocketEvents[U]): this;
  emit<U extends keyof SocketEvents>(
    event: U,
    ...args: Parameters<SocketEvents[U]>
  ): boolean;
}
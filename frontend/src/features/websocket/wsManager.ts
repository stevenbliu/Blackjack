import { EventEmitter } from "./wsManagerParts/eventEmitter";
import { PendingRequestsManager } from "./wsManagerParts/pendingRequestsManager";
import { MessageQueueManager } from "./wsManagerParts/messageQueueManager";
import { ConnectionManager } from "./wsManagerParts/connectionManager";
import { SocketError, SocketConfig } from "./wsManagerParts/connectionManager";

export class SocketIOManager extends EventEmitter {
  private static instance: SocketIOManager;
  private config: SocketConfig;

  private connectionManager: ConnectionManager;
  private messageQueueManager = new MessageQueueManager();
  private pendingRequestsManager = new PendingRequestsManager();
  private namespaceHandlers = new Map<string, (message: any) => void>();

  private constructor(config: Partial<SocketConfig> = {}) {
    super();
    this.config = {
      url: "http://localhost:8000",
      autoReconnect: true,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      requestTimeout: 20000,
      heartbeatInterval: 30000,
      namespace: "/",
      ...config,
    };

    this.connectionManager = new ConnectionManager(
      this.config,
      this.handleError.bind(this),
      this.handleConnectionStateChange.bind(this)
    );
  }

  static getInstance(config?: Partial<SocketConfig>) {
    if (!SocketIOManager.instance) {
      SocketIOManager.instance = new SocketIOManager(config);
    }
    return SocketIOManager.instance;
  }

  async connect(token?: string) {
    console.log("wsMnager token" + token);
    await this.connectionManager.connect(token);
  }

  disconnect() {
    this.connectionManager.disconnect();
  }

  registerNamespace(namespace: string, handler: (message: any) => void) {
    this.namespaceHandlers.set(namespace, handler);
    this.connectionManager.registerNamespace(namespace, handler);
  }

  async send<T = any, R = any>(message: {
    type: string;
    payload: T;
    messageId?: string;
    timeout?: number;
    namespace?: string;
    retries?: number;
  }): Promise<R> {
    const ns = message.namespace ?? this.config.namespace;
    
    if (!this.connectionManager.getNamespaceState(ns)) {
      if (message.messageId && !this.messageQueueManager) {
        this.messageQueueManager.enqueue(ns, message, message.retries || 0);
      }
      throw {
        code: "NOT_CONNECTED",
        message: `Socket not connected (namespace: ${ns})`,
        isOperational: true,
      };
    }

    const requestId = this.generateRequestId();

    return new Promise<R>((resolve, reject) => {
      this.pendingRequestsManager.add(
        requestId,
        resolve,
        reject,
        message.timeout || this.config.requestTimeout
      );

      try {
        this.connectionManager.emit(
          ns,
          message.type,
          { ...message.payload, requestId }
        );
      } catch (err) {
        reject({
          code: "SEND_FAILURE",
          message: "Failed to send message",
          isOperational: false,
          originalError: err,
        });
        this.pendingRequestsManager.reject(requestId, {
          code: "SEND_FAILURE",
          message: "Failed to send message",
          isOperational: false,
        });
      }
    });
  }

  private handleIncomingMessage(message: any) {
    const handler = this.namespaceHandlers.get(message.__ns || "/");
    if (handler) {
      handler(message);
    }

    if (message.requestId) {
      if (message.error) {
        this.pendingRequestsManager.reject(message.requestId, {
          code: "SERVER_ERROR",
          message: message.error,
          isOperational: true,
        });
      } else {
        this.pendingRequestsManager.resolve(message.requestId, message.payload);
      }
      return;
    }

    this.emit(message.type, message.payload);
  }

  private handleError(error: SocketError) {
    this.emit("error", error);
    console.error(`Socket Error [${error.code}]: ${error.message}`);
  }

  private handleConnectionStateChange(namespace: string, state: string) {
    this.emit("connection_state_changed", { namespace, state });
  }

  private generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConnectionState(namespace?: string): string | undefined {
    const ns = namespace ?? this.config.namespace;
    return this.connectionManager.getNamespaceState(ns);
  }

  public updateAuthToken(token: string): void {
    this.config.authToken = token;
    this.connectionManager.updateAuthToken(token);
  }

  public setNamespace(ns: string) {
    this.config.namespace = ns;
  }

  cleanup() {
    this.pendingRequestsManager.clearAll();
    this.messageQueueManager.clearAll();
    this.connectionManager.disconnect();
  }
}
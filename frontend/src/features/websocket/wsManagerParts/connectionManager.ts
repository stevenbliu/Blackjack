import { io, Socket, Manager } from 'socket.io-client';

export interface SocketConfig {
  url: string;
  autoReconnect: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
  authToken: string;
  namespace?: string;
}

export interface SocketError {
  code: string;
  message: string;
  isOperational: boolean;
  originalError?: any;
}

export class ConnectionManager {
  private manager: Manager | null = null;
  private rootSocket: Socket | null = null;
  private namespaceSockets = new Map<string, Socket>();
  private states = new Map<string, string>();
  private config: SocketConfig;
  private errorHandler: (error: SocketError) => void;
  private messageHandlers = new Map<string, (message: any) => void>();
  private stateHandler: (namespace: string, state: string) => void;
  private connectionPromise: Promise<void> | null = null;

  constructor(
    config: SocketConfig,
    onError: (error: SocketError) => void,
    onStateChange: (namespace: string, state: string) => void
  ) {
    this.config = config;
    this.errorHandler = onError;
    this.stateHandler = onStateChange;
  }

  async connect(token?: string): Promise<void> {
    if (token) {
      this.updateAuthToken(token);
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.rootSocket?.connected) {
      return Promise.resolve();
    }

    // console.log("Initializing socket connection with token:", this.config.authToken);

    // Initialize the Manager
    this.manager = new Manager(this.config.url, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: this.config.autoReconnect,
      reconnectionAttempts: this.config.reconnectAttempts,
      reconnectionDelay: this.config.reconnectDelay,
      query: { token: this.config.authToken },
      extraHeaders: {
        Authorization: `Bearer ${this.config.authToken}`
      }
    });

    // Create root namespace socket
    this.rootSocket = this.manager.socket("/", {
      auth: { token: this.config.authToken }
    });

    this.connectionPromise = new Promise((resolve, reject) => {
      if (!this.rootSocket) {
        reject(new Error("Socket initialization failed"));
        return;
      }

      const connectListener = () => {
        console.log(`Connected to ${this.config.url}`);
        this.stateHandler("/", "connected");
        cleanup();
        resolve();
      };

      const connectErrorListener = (err: any) => {
        console.error("Connection error:", err);
        this.stateHandler("/", "disconnected");
        this.errorHandler({
          code: "CONNECTION_ERROR",
          message: err.message,
          isOperational: true,
          originalError: err
        });
        cleanup();
        reject(err);
      };

      const disconnectListener = (reason: string) => {
        console.log("Disconnected:", reason);
        this.stateHandler("/", "disconnected");
        if (reason === "io server disconnect") {
          this.errorHandler({
            code: "SERVER_DISCONNECT",
            message: "Server forcefully disconnected the socket",
            isOperational: true
          });
        }
      };

      const cleanup = () => {
        this.rootSocket?.off("connect", connectListener);
        this.rootSocket?.off("connect_error", connectErrorListener);
        this.rootSocket?.off("disconnect", disconnectListener);
        this.connectionPromise = null;
      };

      this.rootSocket.once("connect", connectListener);
      this.rootSocket.once("connect_error", connectErrorListener);
      this.rootSocket.on("disconnect", disconnectListener);

      this.rootSocket.connect();
    });

    return this.connectionPromise;
  }

  registerNamespace(namespace: string, messageHandler: (message: any) => void): void {
    if (!this.manager) {
      throw new Error("Must connect to root namespace first");
    }

    // Check if namespace already exists
    if (this.namespaceSockets.has(namespace)) {
      console.warn(`Namespace ${namespace} already registered`);
      return;
    }

    // Create new namespace socket
    const nsSocket = this.manager.socket(namespace, {
      auth: { token: this.config.authToken }
    });

    this.namespaceSockets.set(namespace, nsSocket);
    this.messageHandlers.set(namespace, messageHandler);

    nsSocket.on("connect", () => {
      console.log(`Connected to namespace ${namespace}`);
      this.states.set(namespace, "connected");
      this.stateHandler(namespace, "connected");
    });

    nsSocket.on("disconnect", () => {
      console.log(`Disconnected from namespace ${namespace}`);
      this.states.set(namespace, "disconnected");
      this.stateHandler(namespace, "disconnected");
    });

    nsSocket.on("message", messageHandler);
    
    nsSocket.on("error", (err) => {
      this.errorHandler({
        code: "NAMESPACE_ERROR",
        message: `Namespace ${namespace} error: ${err.message}`,
        isOperational: true,
        originalError: err
      });
    });

    // Connect the namespace socket
    nsSocket.connect();
  }

  disconnectNamespace(namespace: string): void {
    const nsSocket = this.namespaceSockets.get(namespace);
    if (nsSocket) {
      nsSocket.off("message");
      nsSocket.off("connect");
      nsSocket.off("disconnect");
      nsSocket.off("error");
      nsSocket.disconnect();
      this.namespaceSockets.delete(namespace);
      this.messageHandlers.delete(namespace);
      this.states.set(namespace, "disconnected");
      this.stateHandler(namespace, "disconnected");
    }
  }

  disconnect(): void {
    // Disconnect all namespace sockets
    this.namespaceSockets.forEach((socket, namespace) => {
      this.disconnectNamespace(namespace);
    });

    // Disconnect root socket
    if (this.rootSocket) {
      this.rootSocket.disconnect();
      this.rootSocket = null;
    }

    // Clear all states
    this.states.forEach((_, namespace) => {
      this.stateHandler(namespace, "disconnected");
    });
    this.states.clear();
    this.messageHandlers.clear();
  }

  emit(namespace: string, event: string, data: any): void {
    const nsSocket = this.namespaceSockets.get(namespace);
    if (!nsSocket) {
      throw new Error(`Not connected to namespace ${namespace}`);
    }
    nsSocket.emit(event, data);
  }

  getNamespaceState(namespace: string): string | undefined {
    return this.states.get(namespace);
  }

  updateAuthToken(token: string): void {
    this.config.authToken = token;
    
    // Update token for manager
    if (this.manager) {
      this.manager.opts.query = { token };
      this.manager.opts.extraHeaders = {
        Authorization: `Bearer ${token}`
      };
    }

    // Update token for existing sockets
    if (this.rootSocket) {
      this.rootSocket.auth = { token };
    }
    
    this.namespaceSockets.forEach(socket => {
      socket.auth = { token };
    });
  }

  isConnected(): boolean {
    return this.rootSocket?.connected || false;
  }

  isNamespaceConnected(namespace: string): boolean {
    const nsSocket = this.namespaceSockets.get(namespace);
    return nsSocket?.connected || false;
  }

  async waitForConnection(): Promise<void> {
    if (this.isConnected()) {
      return Promise.resolve();
    }
    return this.connect();
  }

  async waitForNamespaceConnection(namespace: string): Promise<void> {
    if (this.isNamespaceConnected(namespace)) {
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      const nsSocket = this.namespaceSockets.get(namespace);
      if (nsSocket) {
        nsSocket.once("connect", resolve);
      } else {
        resolve();
      }
    });
  }

  getSocket(): Socket | null {
    return this.rootSocket;
  }

  getNamespaceSocket(namespace: string): Socket | null {
    return this.namespaceSockets.get(namespace) || null;
  }
}
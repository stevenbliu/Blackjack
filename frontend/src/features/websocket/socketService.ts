import { io, Socket } from 'socket.io-client';
// import { store } from '../../app/store';
import { WS_RECEIVED } from './types/actionTypes';

export class SocketService {
  // private static instance: SocketService;
  private mainSocket: Socket | null = null;
  private token: string | null = null;
  private namespaces: Record<string, Socket> = {};
  private username: string | null = null;
  private user_id: string | null = null;

  constructor() {}

  // static getInstance(): SocketService {
  //   if (!SocketService.instance) {
  //     SocketService.instance = new SocketService();
  //   }
  //   return SocketService.instance;
  // }

  async connect(token: string, username: string, user_id: string): Promise<void> {
    if (this.mainSocket?.connected) return;
    this.username = username;
    this.user_id = user_id;
    this.token = token;

    this.mainSocket = io("http://localhost:8000", {
      transports: ["websocket"],
      auth: { token: token, username: username, user_id: user_id },
      query: { token },
      autoConnect: false,
    });

    this.mainSocket?.onAny((event, data) => {
      console.log(`[ANY EVENT] ${event}`, data);
    });

    this.setupCoreListeners();

    await new Promise<void>((resolve, reject) => {
      this.mainSocket!
        .once("connect", resolve)
        .once("connect_error", (err) => {
          console.error("Connection failed:", err);
          reject(err);
        })
        .connect();
        console.log(`Connected to main socket: ${token} ${username} ${user_id}`);

    });
  }

  private setupCoreListeners(): void {
    if (!this.mainSocket) return;

    this.mainSocket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.mainSocket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      this.cleanupNamespaces();
    });

    this.mainSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    // this.mainSocket.on("message", (message: { type: string; payload: any }) => {
    //   store.dispatch({
    //     type: WS_RECEIVED,
    //     payload: message,
    //   });
    // });
  }

  async addNamespace(namespace: string): Socket {
    if (!this.mainSocket?.connected) {
      if (!this.token || !this.username || !this.user_id) {
        throw new Error("Missing credentials for socket connection");
      }
      await this.connect(this.token, this.username, this.user_id);
    }

    const normalizedNs = namespace.startsWith('/') ? namespace : `/${namespace}`;
    // console.log(`🔧 Creating namespace: ${normalizedNs}`);

    // Return existing namespace if already created
    if (this.namespaces[normalizedNs]) {
      // console.log(`♻️ Returning existing namespace: ${normalizedNs}`);
      return this.namespaces[normalizedNs];
    }

    // Create namespace socket using the same server URL
    const url = `http://localhost:8000${normalizedNs}`;
    console.log(`🌐 Connecting to URL: ${url}`);
    
    const nsSocket = io(url, {
      transports: ["websocket"],
      auth: {
        token: this.token,
        username: this.username,
        user_id: this.user_id,
      },
      query: { token: this.token },
      forceNew: false,
      multiplex: true,
    });

    console.log(`📡 Socket created, initial state:`, {
      connected: nsSocket.connected,
      connecting: nsSocket.connecting,
      disconnected: nsSocket.disconnected
    });

    // Setup namespace event handlers
    nsSocket.on('connect', () => {
      console.log(`✅ Namespace ${normalizedNs} connected with ID: ${nsSocket.id}`);
    });

    nsSocket.on('connect_error', (err) => {
      console.error(`❌ Namespace ${normalizedNs} connection error:`, err.message, err.type, err.description);
    });

    nsSocket.on('disconnect', (reason) => {
      console.log(`🔌 Namespace ${normalizedNs} disconnected:`, reason);
    });

    // Add more debugging
    nsSocket.on('connecting', () => {
      console.log(`🔄 Namespace ${normalizedNs} attempting connection...`);
    });

    nsSocket.io.on('error', (err) => {
      console.error(`🔥 Socket.IO engine error for ${normalizedNs}:`, err);
    });

    nsSocket.onAny((event, data) => {
      console.log(`[${normalizedNs.toUpperCase()} EVENT] ${event}`, data);
    });

    // Check if socket connects automatically or needs manual connection
    setTimeout(() => {
      console.log(`⏰ After 1s, namespace ${normalizedNs} state:`, {
        connected: nsSocket.connected,
        connecting: nsSocket.connecting,
        disconnected: nsSocket.disconnected
      });
      
      if (!nsSocket.connected && !nsSocket.connecting) {
        console.log(`🔧 Socket not connecting, forcing connection...`);
        nsSocket.connect();
      }
    }, 1000);

    // Store the namespace socket
    this.namespaces[normalizedNs] = nsSocket;
    return nsSocket;
  }

  private cleanupNamespaces(): void {
    Object.values(this.namespaces).forEach(ns => {
      ns.removeAllListeners();
      ns.disconnect();
    });
    this.namespaces = {};
  }

  getNamespace(namespace: string): Socket | null {
    const normalizedNs = namespace.startsWith('/') ? namespace : `/${namespace}`;
    return this.namespaces[normalizedNs] || null;
  }

  // Send to main socket
  send(message: { event: string; payload: any }) {
    if (!this.mainSocket?.connected) {
      throw new Error("mainSocket not connected");
    }
    this.mainSocket.emit(message.event, message.payload);
  }

  // Send to specific namespace
  sendToNamespace({
      namespace,
      event,
      data
    }: {
      namespace: string;
      event: string;
      data: any;
    }) {
      console.log(`this ns, `, this.namespaces);
    const nsSocket = this.getNamespace(namespace);
    if (!nsSocket?.connected) {
      throw new Error(`Namespace ${namespace} not connected`);
    }
    nsSocket.emit(event, data);
  }

  // Subscribe to main socket events
  subscribe<T = any>(
    event: string,
    handler: (data: T) => void,
  ): () => void {
    console.log(`[Socket] Subscribing to "${event}"`); // Log subscription attempt

    const wrappedHandler = (data: T) => {
      console.log(`[Socket] Received "${event}" data:`, data); // Log received data
      handler(data);
    };

    this.mainSocket?.on(event, wrappedHandler);
    const payload = {
      message: 'Suscribed to ' + event,
    };
    this.mainSocket?.emit(event, payload)

    return () => {
      console.log(`[Socket] Unsubscribing from "${event}"`);
      this.mainSocket?.off(event, wrappedHandler);
    };
  }

  // Subscribe to namespace events
  subscribeToNamespace<T = any>(
    namespace: string,
    event: string,
    handler: (data: T) => void,
  ): () => void {
    const nsSocket = this.getNamespace(namespace);
    if (!nsSocket) {
      throw new Error(`Namespace ${namespace} not found`);
    }

    console.log(`[Socket] Subscribed to "${event}" on namespace ${namespace}`);
    nsSocket.on(event, handler);

    return () => {
      nsSocket.off(event, handler);
      console.log(`[Socket] Unsubscribed from "${event}" on namespace ${namespace}`);
    };
  }

    // Attach event listener to a namespace
  onNamespaceEvent<T = any>(
    namespace: string,
    event: string,
    handler: (data: T) => void
  ): void {
    const nsSocket = this.getNamespace(namespace);
    if (!nsSocket) {
      throw new Error(`Namespace ${namespace} not found`);
    }

    console.log(`[Socket] ON "${event}" @ ${namespace}`);
    nsSocket.on(event, handler);
  }

  // Detach event listener from a namespace
  offNamespaceEvent<T = any>(
    namespace: string,
    event: string,
    handler: (data: T) => void
  ): void {
    const nsSocket = this.getNamespace(namespace);
    if (!nsSocket) {
      console.warn(`[Socket] Tried to OFF "${event}" @ ${namespace} but socket not found`);
      return;
    }

    console.log(`[Socket] OFF "${event}" @ ${namespace}`);
    nsSocket.off(event, handler);
  }


  disconnect() {
    this.cleanupNamespaces();
    this.mainSocket?.disconnect();
    this.mainSocket = null;
  }

  updateToken(newToken: string) {
    this.token = newToken;
    if (this.mainSocket) {
      this.mainSocket.auth = { token: newToken };
      this.mainSocket.io.opts.query = { token: newToken };
    }
    
    // Update token for all namespaces
    Object.values(this.namespaces).forEach(ns => {
      ns.auth = { token: newToken };
      ns.io.opts.query = { token: newToken };
    });
  }
}

// export const socketService = SocketService.getInstance();
// const socketService = new SocketService();
// export default socketService; // App will use this singleton
// export default {SocketService}

// At the end of socketService.ts, replace the exports with:
export default SocketService;

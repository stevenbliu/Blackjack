import { io, Socket } from 'socket.io-client';
// import { store } from '../../app/store';
// import { WS_RECEIVED } from './types/actionTypes';
import { NamespacePayload, SocketMessage } from './types/socketTypes';

const SERVER_URL = "http://localhost:8000"

export class SocketService {
  // private static instance: SocketService;
  public mainSocket: Socket | null = null;
  private token: string | null = null;
  private namespaces: Record<string, Socket> = {};
  private username: string | null = null;
  private user_id: string | null = null;
  private handlers = new Map<string, Set<(data: any) => void>>();
  private namespaceHandlers = new Map<string, Map<string, Set<(data: any) => void>>>();

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

    this.mainSocket = io(SERVER_URL, {
      transports: ["websocket"],
      path: "/socket.io", // Must match server
      forceNew: true,
      upgrade: false,
      auth: { token: token, username: username, user_id: user_id },
      query: { token },
      // autoConnect: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    this.mainSocket?.on("connect", () => {
      console.log("Connected to main socket successfully:", token, username, user_id)
    });

    // console.log('Main Socket', this.mainSocket);

    this.mainSocket?.onAny((event, data) => {
      console.log(`[ANY EVENT] ${event}`, data);
    });

    this.setupCoreListeners();

    // await new Promise<void>((resolve, reject) => {
    //   this.mainSocket!
    //     .once("connect", resolve)
    //     .once("connect_error", (err) => {
    //       console.error("Connection failed:", err);
    //       reject(err);
    //     })
    //     .connect();
    //     console.log(`Connected to main socket successfully: ${token} ${username} ${user_id}`);

    // });
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

  async addNamespace(namespace: string): Promise<Socket> {
    if (!this.mainSocket?.connected) {
        if (!this.token || !this.username || !this.user_id) {
            throw new Error("Missing credentials for socket connection");
        }
        await this.connect(this.token, this.username, this.user_id);
    }

    const normalizedNs = namespace.startsWith('/') ? namespace : `/${namespace}`;

    // Return existing namespace if already created and connected
    if (this.namespaces[normalizedNs] && this.namespaces[normalizedNs].connected) {
        return this.namespaces[normalizedNs];
    }

    // Create namespace socket
    // const NAMESPACE_URL = SERVER_URL + normalizedNs
    // console.log("normaliedN", normalizedNs);

    const nsSocket: Socket = io(SERVER_URL + normalizedNs, {
      // Just use the namespace path
      transports: ["websocket"],
      // path: "/socket.io", // Must match server
      forceNew: true,
      upgrade: false,
      auth: {
        token: this.token,
        username: this.username,
        user_id: this.user_id,
      },
      query: { token: this.token },
      // autoConnect: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000,
    });
    console.log('Waiting for Namespace Connection came.', normalizedNs)

    // Wait for connection or error
    // await new Promise<void>((resolve, reject) => {
    //     const connectTimeout = setTimeout(() => {
    //         reject(new Error(`Connection timeout for namespace ${normalizedNs}`));
    //     }, 5000);  // 5 second timeout

    //     nsSocket
    //         .once("connect", () => {
    //             clearTimeout(connectTimeout);
    //             resolve();
    //         })
    //         .once("connect_error", (err) => {
    //             clearTimeout(connectTimeout);
    //             reject(err);
    //         });
    // });

    console.log('Namespace Connection came.', normalizedNs)

    // Setup event handlers (same as original)
    nsSocket.on('connect', () => {
        console.log(`✅ Namespace ${normalizedNs} connected with ID: ${nsSocket.id}`);
    });

    nsSocket.on('connect_error', (err) => {
      console.error(`❌ Namespace ${normalizedNs} connection error:`, err.message, err.name);
    });

    nsSocket.on('disconnect', (reason) => {
      console.log(`🔌 Namespace ${normalizedNs} disconnected:`, reason);
    });

    // // Add more debugging
    // nsSocket.on('connecting', () => {
    //   console.log(`🔄 Namespace ${normalizedNs} attempting connection...`);
    // });

    nsSocket.io.on('error', (err) => {
      console.error(`🔥 Socket.IO engine error for ${normalizedNs}:`, err);
    });

    nsSocket.on('reconnect_attempt', (attempt) => {
      console.log(`♻ Reconnect attempt #${attempt}`);
    });

    nsSocket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    nsSocket.on('reconnect_failed', () => {
      console.error('❌ Permanent connection failure');
    });

    nsSocket.onAny((event, data) => {
      console.log(`[${normalizedNs.toUpperCase()} EVENT] ${event}`, data);
    });

    // Store the namespace socket
    
    this.namespaces[normalizedNs] = nsSocket;
    console.log(`${normalizedNs} namespace added.`)
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
    console.log(`Sending to main socket data: ${message.payload}`);
    this.mainSocket.emit(message.event, message.payload);
  }

  // Send to specific namespace
  sendToNamespace(
    namespace: string,  
    payload: NamespacePayload<SocketMessage>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try{
        const nsSocket = this.getNamespace(namespace);
        if (!nsSocket?.connected) {
          reject(new Error(`Namespace ${namespace} not connected`));
        }
        console.log(
          `Sending to ${namespace} namespace data: ${payload.event} ${payload.data.message} ${payload.data.type}`
        );
        nsSocket?.emit(payload.event, payload.data, (response: any) => {
          resolve(response);
        });    
      } catch (error) {
        reject(error);
      }
    });
  }


  async subscribe<T = any>(
    event: string,
    handler: (data: T) => void
  ): Promise<() => void> {
    if (!this.mainSocket) throw new Error("Socket not connected");
    console.log('set handers before:', this.handlers)

    // Initialize handler set if not exists
    if (!this.handlers.has(event)) {
      console.log("Sett handler");
      this.handlers.set(event, new Set());

      console.log('handling data:',);

      this.mainSocket.on(event, (data: T) => {

        this.handlers.get(event)?.forEach(h => {
          h(data);
          console.log("1231231");
        });
      });
    }
    console.log('set handers after:', this.handlers)

    // Add handler to set
    this.handlers.get(event)?.add(handler);
    console.log(" added handler:", this.handlers)

    // Get server acknowledgment
    const ack = await new Promise<any>((resolve, reject) => {
      this.mainSocket!.emit(
        "subscribe",
        { event },
        (response: { success: boolean; reason?: string }) => {
          console.log("Subscribe Response:", response);
          if (response?.success) {
            resolve(response);
          } else {
            reject(new Error(response?.reason || "Subscription failed"));
          }
        }
      );
    });

    // Return unsubscribe function
    return () => {
      this.handlers.get(event)?.delete(handler);
      if (this.handlers.get(event)?.size === 0) {
        this.mainSocket?.emit('unsubscribe', { event });
        this.handlers.delete(event);
      }
    };
  }

  // Subscribe to namespace events
 subscribeToNamespace<T = any>(
    namespace: string,
    event: string,
    handler: (data: T) => void
  ): () => void {
    const normalizedNs = namespace.startsWith('/') ? namespace : `/${namespace}`;
    
    // Initialize namespace tracking
    if (!this.namespaceHandlers.has(normalizedNs)) {
      this.namespaceHandlers.set(normalizedNs, new Map());
    }
    
    const nsHandlers = this.namespaceHandlers.get(normalizedNs)!;
    let nsSocket;

    // Initialize event tracking
    if (!nsHandlers.has(event)) {
      nsHandlers.set(event, new Set());
      nsSocket = this.getNamespace(namespace);
      nsSocket?.on(event, (data: T) => {
        nsHandlers.get(event)?.forEach(h => h(data));
      });
    }


    
    // Add handler
    nsHandlers.get(event)?.add(handler);
    
    return () => {
      nsHandlers.get(event)?.delete(handler);
      if (nsHandlers.get(event)?.size === 0) {
        this.getNamespace(namespace)?.off(event);
        nsHandlers.delete(event);
      }
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

  unsubscribeAll(event: string): void {
    this.handlers.get(event)?.forEach(handler => {
      this.handlers.get(event)?.delete(handler);
    });
    this.mainSocket?.emit('unsubscribe', { event });
    this.handlers.delete(event);
  }

  unsubscribeAllFromNamespace(namespace: string, event: string): void {
    const normalizedNs = namespace.startsWith('/') ? namespace : `/${namespace}`;
    const nsHandlers = this.namespaceHandlers.get(normalizedNs);
    nsHandlers?.get(event)?.forEach(handler => {
      nsHandlers.get(event)?.delete(handler);
    });
    this.getNamespace(namespace)?.off(event);
    nsHandlers?.delete(event);
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

    updateUsername(newUsername: string) {
    this.username = newUsername;
    if (this.mainSocket) {
      this.mainSocket.auth = { username: newUsername };
      this.mainSocket.io.opts.query = { username: newUsername };
    }
    
    // Update token for all namespaces
    Object.values(this.namespaces).forEach(ns => {
      ns.auth = { username: newUsername };
      ns.io.opts.query = { username: newUsername };
    });
  }

    updateUserId(newUser_Id: string) {
    this.user_id = newUser_Id;
    if (this.mainSocket) {
      this.mainSocket.auth = { user_id: newUser_Id };
      this.mainSocket.io.opts.query = { user_id: newUser_Id };
    }
    
    // Update token for all namespaces
    Object.values(this.namespaces).forEach(ns => {
      ns.auth = { user_id: newUser_Id };
      ns.io.opts.query = { user_id: newUser_Id };
    });
  }

  
}

// export const socketService = SocketService.getInstance();
// const socketService = new SocketService();
// export default socketService; // App will use this singleton
// export default {SocketService}

// At the end of socketService.ts, replace the exports with:
export default SocketService;

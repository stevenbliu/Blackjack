// WebSocketManager.ts

export type WebSocketMessage = {
  action: string;
  requestId?: string;
  [key: string]: any;
};

export class WebSocketManager {
  private socket: WebSocket;
  private pendingRequests: Map<string, (message: WebSocketMessage) => void> = new Map();
  private eventHandlers: ((message: WebSocketMessage) => void)[] = [];

  ready: Promise<void>; // <-- New promise!

  constructor(url: string) {
    this.socket = new WebSocket(url);

    this.ready = new Promise((resolve, reject) => {
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        resolve(); // <-- When connected, resolve the Promise
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error); // <-- If error during connect, reject the Promise
      };
    });

    this.socket.onmessage = this.onMessage.bind(this);

    this.socket.onclose = () => {
      console.log('WebSocket closed');
    };
  }

  private generateRequestId(): string {
    const requestId = Math.random().toString(36).substring(2, 15);
    console.log('Generated requestId:', requestId);
    return requestId;
  }

  // General send method that returns a Promise
  send(message: WebSocketMessage): Promise<WebSocketMessage> {
    const requestId = this.generateRequestId();
    message.requestId = requestId;

    const promise = new Promise<WebSocketMessage>((resolve) => {
      this.pendingRequests.set(requestId, resolve);
    });

    console.log('Sending message:', message, 'with requestId:', requestId);
    this.socket.send(JSON.stringify(message));
    return promise;
  }

  // Called whenever a message is received
  private onMessage(event: MessageEvent) {
    const message: WebSocketMessage = JSON.parse(event.data);

    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      console.log('Resolving message:', message, 'for requestId:', message.requestId);
      const resolve = this.pendingRequests.get(message.requestId)!;
      resolve(message);
      this.pendingRequests.delete(message.requestId);
    } else {
      // No matching requestId — broadcast it as a general event
      console.log('Broadcasting event:', message, 'without requestId');
      this.eventHandlers.forEach(handler => handler(message));
    }
  }

  // You can subscribe to general game events (like player joined, game over, etc.)
  onEvent(handler: (message: WebSocketMessage) => void) {
    this.eventHandlers.push(handler);
  }

  // Close the socket manually if needed
  close() {
    this.socket.close();
  }
}

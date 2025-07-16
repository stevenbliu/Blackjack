export interface WebSocketMessage {
  action: string;
  [key: string]: any;
}

export class WebSocketManager {
  private ws: WebSocket;
  private eventCallback: (message: WebSocketMessage) => void = () => {};

  public ready: Promise<void>;

  constructor(url: string) {
    this.ws = new WebSocket(url);

    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
    });

    this.ws.onmessage = (event) => {
      let data: WebSocketMessage;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = { action: 'unknown', data: event.data };
      }
      this.eventCallback(data);
    };
  }

  onEvent(callback: (message: WebSocketMessage) => void) {
    this.eventCallback = callback;
  }

  send(message: WebSocketMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket is not open'));
      }
      this.ws.send(JSON.stringify(message));

      // Simplified: resolve immediately.
      // You can enhance this to wait for server response if protocol allows.
      resolve({ status: 'sent' });
    });
  }
}

export interface WebSocketMessage {
  action: string;
  [key: string]: any;
}

export class WebSocketManager {
  public ws!: WebSocket;
  private eventCallback: (message: WebSocketMessage) => void = () => {};
  private url: string;

  public ready: Promise<void>;
  private readyResolve!: () => void;
  private readyReject!: (err: any) => void;

  constructor(url: string) {
    this.url = url;

    // Create a promise that resolves when ws is open
    this.ready = new Promise((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
    });

    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.readyResolve();
    };

    this.ws.onerror = (event) => {
      this.readyReject(new Error('WebSocket error'));
    };

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

  public onEvent(callback: (message: WebSocketMessage) => void) {
    this.eventCallback = callback;
  }

  public send(message: WebSocketMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket is not open'));
      }
      try {
        this.ws.send(JSON.stringify(message));
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}

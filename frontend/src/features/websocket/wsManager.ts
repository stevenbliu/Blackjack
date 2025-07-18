export interface WebSocketMessage {
  action: string;
  [key: string]: any;
}

export class WebSocketManager {
  public ws!: WebSocket;
  private url: string;
  private eventCallback: (message: WebSocketMessage) => void = () => {};

  public ready: Promise<void>;
  private readyResolve!: () => void;
  private readyReject!: (err: any) => void;

  constructor(url: string) {
    this.url = url;

    this.ready = new Promise((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
    });

    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WSManager] Connected to', this.url);
      this.readyResolve();
    };

    this.ws.onerror = (event) => {
      console.error('[WSManager] WebSocket error');
      this.readyReject(new Error('WebSocket error'));
    };

    this.ws.onmessage = (event) => {
      let data: WebSocketMessage;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.warn('[WSManager] Failed to parse message:', event.data);
        return;
      }

      this.eventCallback(data);
    };
  }

  public close() {
    this.ws.close();
  }

  public onEvent(callback: (message: WebSocketMessage) => void) {
    this.eventCallback = callback;
  }

  public async send(message: WebSocketMessage): Promise<void> {
    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[WSManager] Failed to send message:', error);
      throw error;
    }
  }
}

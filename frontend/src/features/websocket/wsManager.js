export class WebSocketManager {
    ws;
    eventCallback = () => { };
    url;
    ready;
    readyResolve;
    readyReject;
    constructor(url) {
        this.url = url;
        // Create a promise that resolves when ws is open
        this.ready = new Promise((resolve, reject) => {
            this.readyResolve = resolve;
            this.readyReject = reject;
        });
        this.connect();
    }
    connect() {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
            this.readyResolve();
        };
        this.ws.onerror = (event) => {
            this.readyReject(new Error('WebSocket error'));
        };
        this.ws.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            }
            catch {
                data = { action: 'unknown', data: event.data };
            }
            this.eventCallback(data);
        };
    }
    onEvent(callback) {
        this.eventCallback = callback;
    }
    send(message) {
        return new Promise((resolve, reject) => {
            if (this.ws.readyState !== WebSocket.OPEN) {
                return reject(new Error('WebSocket is not open'));
            }
            try {
                this.ws.send(JSON.stringify(message));
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}

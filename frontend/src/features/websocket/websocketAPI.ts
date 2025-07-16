import { WebSocketManager, WebSocketMessage } from './wsManager';

let wsManager: WebSocketManager | null = null;

function getManager(): WebSocketManager {
  if (!wsManager) {
    // Use same protocol and host/port as frontend
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    // Use window.location.host (includes port if any)
    const WS_URL = `${protocol}://${window.location.host}/ws`;

    wsManager = new WebSocketManager(WS_URL);
  }
  return wsManager;
}

/**
 * Send a WebSocket message and wait for a response matching
 * `${action}_response`.
 * Rejects if no response within 5 seconds or if WS errors.
 */
export function sendWsMessage(message: WebSocketMessage): Promise<any> {
  const manager = getManager();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('WebSocket response timeout'));
    }, 5000);

    // Temporary listener for the response event
    const responseHandler = (response: WebSocketMessage) => {
      if (response.action === `${message.action}_response`) {
        clearTimeout(timeout);
        manager.onEvent(() => {}); // clear listener
        resolve(response);
      }
    };

    manager.onEvent(responseHandler);

    manager.ready
      .then(() => {
        try {
          manager.send(message);
        } catch (sendError) {
          clearTimeout(timeout);
          manager.onEvent(() => {}); // clear listener
          reject(sendError);
        }
      })
      .catch((readyError) => {
        clearTimeout(timeout);
        manager.onEvent(() => {}); // clear listener
        reject(readyError);
      });
  });
}

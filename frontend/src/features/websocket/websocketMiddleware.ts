import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import { WebSocketMessage, WebSocketManager } from './wsManager';
import { SEND_WS_MESSAGE, WS_RECEIVED, WS_CONNECTED, WS_ERROR } from './actionTypes';

let wsManager: WebSocketManager | null = null;

const websocketMiddlewareFn = (store: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
  console.log('[Middleware] Received action:', action);

  if (action.type !== SEND_WS_MESSAGE) {
    return next(action);
  }

  if (!wsManager) {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const WS_URL = `${protocol}://${window.location.hostname}:8000/ws`;

    console.log(`[Middleware] Creating WebSocketManager with URL: ${WS_URL}`);

    wsManager = new WebSocketManager(WS_URL);

    wsManager.ready
      .then(() => {
        console.log('[Middleware] WebSocket connected');
        store.dispatch({ type: WS_CONNECTED });
      })
      .catch(error => {
        console.error('[Middleware] WebSocket connection error:', error);
        store.dispatch({ type: WS_ERROR, payload: { message: error.message, stack: error.stack } });
      });

    wsManager.onEvent((message: WebSocketMessage) => {
      console.log('[Middleware] Received message from WebSocket:', message);
      store.dispatch({ type: WS_RECEIVED, payload: message });
    });
  }

  console.log('[Middleware] Sending message:', action.payload);
  wsManager.send(action.payload as WebSocketMessage)
    .then(response => {
      console.log('[Middleware] Message sent successfully, response:', response);
      store.dispatch({ type: WS_RECEIVED, payload: response });
    })
    .catch(error => {
      console.error('[Middleware] Error sending message:', error);
      store.dispatch({ type: WS_ERROR, payload: { message: error.message, stack: error.stack } });
    });

  return next(action);
};



export const websocketMiddleware = websocketMiddlewareFn as Middleware;

import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import { WebSocketMessage, WebSocketManager } from './wsManager';
import { SEND_WS_MESSAGE, WS_RECEIVED, WS_CONNECTED, WS_ERROR } from './actionTypes';

let wsManager: WebSocketManager | null = null;

// Keep track of outgoing chat message IDs to filter echoes
const sentChatMessageIds = new Set<string>();

const websocketMiddlewareFn = (store: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
  // Step 1: Track outgoing chat message IDs when dispatching SEND_WS_MESSAGE
  if (action.type === SEND_WS_MESSAGE) {
    const message = action.payload as WebSocketMessage;

    // If this is a chat_message, save its ID
    if (message.action === 'chat_message' && message.message_id) {
      sentChatMessageIds.add(message.message_id);
    }
  }

  // Step 2: Filter incoming WS messages that are echoed chat messages already sent
  if (action.type === WS_RECEIVED) {
    const message = action.payload as WebSocketMessage;

    if (message.action === 'chat_message' && message.message_id) {
      if (sentChatMessageIds.has(message.message_id)) {
        // Remove the ID from the set to prevent memory leak
        sentChatMessageIds.delete(message.message_id);
        // Skip dispatching this echoed message to avoid duplicate in chat
        return;
      }
    }
  }

  // Initialize WebSocketManager if needed
  if (!wsManager && action.type === SEND_WS_MESSAGE) {
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

  // Send message if action is SEND_WS_MESSAGE
  if (action.type === SEND_WS_MESSAGE && wsManager) {
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
  }

  return next(action);
};

export const websocketMiddleware = websocketMiddlewareFn as Middleware;

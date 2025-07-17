import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import { WebSocketMessage, WebSocketManager } from './wsManager';
import {
  SEND_WS_MESSAGE,
  WS_RECEIVED,
  WS_CONNECTED,
  WS_ERROR,
  PLAYER_ID_RECEIVED,
} from './actionTypes';
import { setPlayerId } from '../player/playerSlice'; // adjust path as needed

let wsManager: WebSocketManager | null = null;
const sentChatMessageIds = new Set<string>();

const websocketMiddlewareFn = (store: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
  if (action.type === SEND_WS_MESSAGE) {
    const message = action.payload as WebSocketMessage;
    if (message.action === 'chat_message' && message.id) {
      sentChatMessageIds.add(message.id);
    }
  }

  if (action.type === WS_RECEIVED) {
    const message = action.payload as WebSocketMessage;

    // Filter echoed chat messages
    if (message.action === 'chat_message' && message.id) {
      if (sentChatMessageIds.has(message.id)) {
        sentChatMessageIds.delete(message.id);
        return;
      }
    }

    // Handle player_id message
    if (message.action === 'player_id' && message.playerId) {
      console.log('[Middleware] Received player_id:', message.playerId);
      localStorage.setItem('playerId', message.playerId);
      // store.dispatch({ type: PLAYER_ID_RECEIVED, payload: message.player_id });
      store.dispatch(setPlayerId(message.playerId));

    }
  }

  // Trigger connection setup (only once)
  if (!wsManager && action.type === SEND_WS_MESSAGE) {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const WS_URL = `${protocol}://${window.location.hostname}:8000/ws`;

    console.log(`[Middleware] Creating WebSocketManager with URL: ${WS_URL}`);
    wsManager = new WebSocketManager(WS_URL);

    wsManager.ready
      .then(async () => {
        console.log('[Middleware] WebSocket connected');
        store.dispatch({ type: WS_CONNECTED });

        const requestPlayerId: WebSocketMessage = { action: 'request_player_id' };
        try {
          await wsManager?.send(requestPlayerId);
        } catch (err) {
          console.error('[Middleware] Error sending request_player_id:', err);
        }
      })
      .catch((error) => {
        console.error('[Middleware] WebSocket connection error:', error);
        store.dispatch({ type: WS_ERROR, payload: { message: error.message, stack: error.stack } });
      });

    wsManager.onEvent((message: WebSocketMessage) => {
      console.log('[Middleware] Received message from WebSocket:', message);
      store.dispatch({ type: WS_RECEIVED, payload: message });
    });
  }

  // Send messages when connected
  if (action.type === SEND_WS_MESSAGE && wsManager) {
    (async () => {
      try {
        await wsManager.ready;
        console.log('[Middleware] Sending message:', action.payload);
        const response = await wsManager.send(action.payload as WebSocketMessage);
        store.dispatch({ type: WS_RECEIVED, payload: response });
      } catch (error) {
        console.error('[Middleware] Error sending message:', error);
        store.dispatch({ type: WS_ERROR, payload: { message: error.message, stack: error.stack } });
      }
    })();
  }

  return next(action);
};

export const websocketMiddleware = websocketMiddlewareFn as Middleware;

import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import { WebSocketMessage, WebSocketManager } from './wsManager';
import {
  SEND_WS_MESSAGE,
  WS_RECEIVED,
  WS_CONNECTED,
  WS_ERROR,
} from './actionTypes';
import { setPlayerId } from '../player/playerSlice';
import { setError } from '../error/errorSlice';

const createWebsocketMiddleware = (): Middleware => {
  let wsManager: WebSocketManager | null = null;
  let messageQueue: WebSocketMessage[] = [];
  let reconnectAttempts = 0;
  let isConnecting = false;

  // Track IDs of sent chat messages to filter echoes
  const sentChatMessageIds = new Set<string>();

  // Initialize WebSocket and set up handlers
  const initWebSocket = (store: MiddlewareAPI) => {
    if (wsManager || isConnecting) return; 
    isConnecting = true;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const WS_URL = `${protocol}://${window.location.hostname}:8000/ws`;
    console.log(`[Middleware] Connecting WebSocket at ${WS_URL}`);

    wsManager = new WebSocketManager(WS_URL);

    wsManager.ready
      .then(async () => {
        reconnectAttempts = 0;
        isConnecting = false;
        console.log('[Middleware] WebSocket connected');
        store.dispatch({ type: WS_CONNECTED });

        // Flush queued messages and track sent chat message IDs
        while (messageQueue.length) {
          const msg = messageQueue.shift()!;
          if (msg.action === 'chat_message' && msg.id) {
            sentChatMessageIds.add(msg.id);
          }
          try {
            await wsManager.send(msg);
          } catch (error) {
            console.error('[Middleware] Error sending queued message:', error);
            store.dispatch({ type: WS_ERROR, payload: { message: error.message, stack: error.stack } });
          }
        }

        // Request player ID from server
        const requestPlayerId: WebSocketMessage = { action: 'request_player_id' };
        try {
          await wsManager.send(requestPlayerId);
        } catch (err) {
          console.error('[Middleware] Error sending request_player_id:', err);
        }
      })
      .catch((error) => {
        isConnecting = false;
        console.error('[Middleware] WebSocket connection error:', error);
        store.dispatch({ type: WS_ERROR, payload: { message: error.message, stack: error.stack } });
        store.dispatch(setError(error.message));

        reconnectAttempts++;
        const delay = Math.min(10000, 1000 * 2 ** reconnectAttempts);
        console.log(`[Middleware] Reconnecting WebSocket in ${delay}ms`);
        setTimeout(() => {
          wsManager = null;
          initWebSocket(store);
        }, delay);
      });

    wsManager.onEvent((message: WebSocketMessage) => {
      // Ignore echoed chat messages (sent by us)
      if (message.action === 'chat_message' && message.id) {
        if (sentChatMessageIds.has(message.id)) {
          sentChatMessageIds.delete(message.id);
          return; // skip processing echoed message
        }
      }

      if (message.action === 'player_id' && message.playerId) {
        console.log('[Middleware] Received player_id:', message.playerId);
        localStorage.setItem('playerId', message.playerId);
        store.dispatch(setPlayerId(message.playerId));
      }

      store.dispatch({ type: WS_RECEIVED, payload: message });
    });

    wsManager.ws.onclose = () => {
      console.warn('[Middleware] WebSocket closed, attempting reconnect...');
      wsManager = null;
      reconnectAttempts++;
      const delay = Math.min(10000, 1000 * 2 ** reconnectAttempts);
      setTimeout(() => initWebSocket(store), delay);
    };
  };

  return (store: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
    if (!wsManager && action.type === SEND_WS_MESSAGE) {
      initWebSocket(store);
    }

    if (action.type === SEND_WS_MESSAGE) {
      const message = action.payload as WebSocketMessage;

      // Track sent chat message IDs
      if (message.action === 'chat_message' && message.id) {
        sentChatMessageIds.add(message.id);
      }

      if (wsManager && wsManager.ws.readyState === WebSocket.OPEN) {
        wsManager.send(message).catch((error) => {
          console.error('[Middleware] Error sending message:', error);
          store.dispatch({ type: WS_ERROR, payload: { message: error.message, stack: error.stack } });
        });
      } else {
        console.log('[Middleware] WS not ready, queueing message');
        messageQueue.push(message);
      }
    }

    return next(action);
  };
};

export const websocketMiddleware = createWebsocketMiddleware();


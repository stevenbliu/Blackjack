import { Middleware, MiddlewareAPI, Dispatch } from '@reduxjs/toolkit';
import { WebSocketMessage, WebSocketManager } from './wsManager';
import {
  SEND_WS_MESSAGE,
  WS_RECEIVED,
  WS_CONNECTED,
  WS_ERROR,
} from './actionTypes';
import { setPlayerId } from '../player/playerSlice';
import { setError } from '../error/errorSlice';

const isDev = import.meta.env.DEV;

const backendUrl = isDev
  ? `${window.location.protocol}//${window.location.hostname}:8000`
  : 'https://blackjack-backend-ctfq.onrender.com/';
const wsUrl = `${backendUrl.replace(/^http/, 'ws')}/ws`;

type Resolver = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeoutId: number;
};

const pendingRequests: Record<string, Resolver> = {};
const sentChatMessageIds = new Set<string>();

let wsManager: WebSocketManager | null = null;
let isConnecting = false;
let messageQueue: WebSocketMessage[] = [];
let reconnectAttempts = 0;
let storeRef: MiddlewareAPI | null = null;

function startWebSocket(store: MiddlewareAPI) {
  if (wsManager || isConnecting) return;

  isConnecting = true;
  const wsEndpoint = `${wsUrl}`;
  console.log(`[WS] Connecting to ${wsEndpoint}`);
  wsManager = new WebSocketManager(wsEndpoint);

  wsManager.ready
    .then(() => {
      isConnecting = false;
      reconnectAttempts = 0;
      store.dispatch({ type: WS_CONNECTED });
      console.log('[WS] Connected');

      // Drain queue
      messageQueue.forEach((msg) => wsManager?.send(msg));
      messageQueue = [];

      // Request player ID
      wsManager?.send({ action: 'request_player_id' });
    })
    .catch((err: Error) => {
      isConnecting = false;
      wsManager = null;
      console.error('[WS] Connection failed:', err);
      store.dispatch(setError(err.message));
      store.dispatch({ type: WS_ERROR, payload: { message: err.message, stack: err.stack } });

      const delay = Math.min(10000, 1000 * 2 ** reconnectAttempts++);
      setTimeout(() => startWebSocket(store), delay);
    });

  wsManager.onEvent((message: WebSocketMessage) => {
    const id = message.requestId || message.requestId;

    // Skip duplicates
    if (message.action === 'chat_message' && message.id && sentChatMessageIds.has(message.id)) {
      sentChatMessageIds.delete(message.id);
      return;
    }

    // Resolve promises
    if (id && pendingRequests[id]) {
      const { resolve, reject, timeoutId } = pendingRequests[id];
      clearTimeout(timeoutId);
      delete pendingRequests[id];

      message.success === false
        ? reject(new Error(message.error || 'Unknown WebSocket error'))
        : resolve(message);
      return;
    }

    // Special handling for player ID
    if (message.action === 'player_id' && message.playerId) {
      localStorage.setItem('playerId', message.playerId);
      store.dispatch(setPlayerId(message.playerId));
    }

    store.dispatch({ type: WS_RECEIVED, payload: message });
  });

  wsManager.ws.onclose = () => {
    console.warn('[WS] Connection closed, reconnecting...');
    wsManager = null;
    const delay = Math.min(10000, 1000 * 2 ** reconnectAttempts++);
    setTimeout(() => startWebSocket(store), delay);
  };
}

export const websocketMiddleware: Middleware = (store) => {
  storeRef = store;

  return (next) => (action: any) => {
    if (action.type === SEND_WS_MESSAGE) {
      const message: WebSocketMessage = { ...action.payload };

      // Attach a unique message ID if missing
      if (!message.requestId) {
        message.requestId = crypto.randomUUID();
      }

      // Track chat IDs to suppress echoes
      if (message.action === 'chat_message' && message.id) {
        sentChatMessageIds.add(message.id);
      }

      // Return a Promise tied to the requestId
      const promise = new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          delete pendingRequests[message.requestId!];
          reject(new Error('WebSocket request timed out'));
        }, 10000);

        pendingRequests[message.requestId!] = { resolve, reject, timeoutId };
      });

      // Send immediately or queue
      if (wsManager?.ws.readyState === WebSocket.OPEN) {
        wsManager.send(message).catch((err) => {
          if (message.requestId) delete pendingRequests[message.requestId];
          store.dispatch({ type: WS_ERROR, payload: { message: err.message, stack: err.stack } });
        });
      } else {
        console.log('[WS] Not ready. Queueing message:', message);
        messageQueue.push(message);
        startWebSocket(store);
      }

      return promise;
    }

    return next(action);
  };
};

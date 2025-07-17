import { WebSocketManager } from './wsManager';
import { SEND_WS_MESSAGE, WS_RECEIVED, WS_CONNECTED, WS_ERROR, } from './actionTypes';
import { setPlayerId } from '../player/playerSlice';
import { setError } from '../error/errorSlice';
const createWebsocketMiddleware = () => {
    let wsManager = null;
    let messageQueue = [];
    let reconnectAttempts = 0;
    let isConnecting = false;
    let middlewareStore = null;
    const sentChatMessageIds = new Set();
    const initWebSocket = (store) => {
        if (wsManager || isConnecting)
            return;
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
            while (messageQueue.length) {
                const msg = messageQueue.shift();
                if (msg.action === 'chat_message' && msg.id) {
                    sentChatMessageIds.add(msg.id);
                }
                try {
                    if (wsManager?.ws.readyState === WebSocket.OPEN) {
                        await wsManager.send(msg);
                    }
                }
                catch (error) {
                    if (error instanceof Error) {
                        console.error('[Middleware] Error sending queued message:', error);
                        store.dispatch({
                            type: WS_ERROR,
                            payload: { message: error.message, stack: error.stack },
                        });
                    }
                }
            }
            const requestPlayerId = { action: 'request_player_id' };
            try {
                if (wsManager?.ws.readyState === WebSocket.OPEN) {
                    await wsManager.send(requestPlayerId);
                }
            }
            catch (err) {
                if (err instanceof Error) {
                    console.error('[Middleware] Error sending request_player_id:', err);
                }
            }
        })
            .catch((error) => {
            isConnecting = false;
            if (error instanceof Error) {
                console.error('[Middleware] WebSocket connection error:', error);
                store.dispatch({
                    type: WS_ERROR,
                    payload: { message: error.message, stack: error.stack },
                });
                store.dispatch(setError(error.message));
            }
            reconnectAttempts++;
            const delay = Math.min(10000, 1000 * 2 ** reconnectAttempts);
            console.log(`[Middleware] Reconnecting WebSocket in ${delay}ms`);
            setTimeout(() => {
                wsManager = null;
                if (middlewareStore) {
                    initWebSocket(middlewareStore);
                }
            }, delay);
        });
        wsManager.onEvent((message) => {
            if (message.action === 'chat_message' && message.id) {
                if (sentChatMessageIds.has(message.id)) {
                    sentChatMessageIds.delete(message.id);
                    return;
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
            setTimeout(() => {
                if (middlewareStore) {
                    initWebSocket(middlewareStore);
                }
            }, delay);
        };
    };
    return (store) => {
        middlewareStore = store;
        return (next) => (action) => {
            if (action.type === SEND_WS_MESSAGE && !wsManager) {
                initWebSocket(store);
            }
            if (action.type === SEND_WS_MESSAGE) {
                const message = action.payload;
                if (message.action === 'chat_message' && message.id) {
                    sentChatMessageIds.add(message.id);
                }
                if (wsManager?.ws.readyState === WebSocket.OPEN) {
                    wsManager.send(message).catch((error) => {
                        if (error instanceof Error) {
                            console.error('[Middleware] Error sending message:', error);
                            store.dispatch({
                                type: WS_ERROR,
                                payload: { message: error.message, stack: error.stack },
                            });
                        }
                    });
                }
                else {
                    console.log('[Middleware] WS not ready, queueing message');
                    messageQueue.push(message);
                }
            }
            return next(action);
        };
    };
};
export const websocketMiddleware = createWebsocketMiddleware();

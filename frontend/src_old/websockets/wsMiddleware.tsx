import { Middleware } from '@reduxjs/toolkit';
import { SEND_WS_MESSAGE, WS_CONNECTED, WS_RECEIVED } from './actionTypes';
import { WebSocketManager } from '../websockets/wsManager';



let wsManager: WebSocketManager | null = null;

export const websocketMiddleware: Middleware = (store: any) => next => async (action: any) => {
    // console.log('WebSocket Middleware:', action);
    switch (action.type) {
        case SEND_WS_MESSAGE:
            console.log('Sending WebSocket message:', action.payload);
            if (!wsManager) {
                const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
                const WS_URL = `${protocol}://${window.location.hostname}:8000/ws`;
                wsManager = await new WebSocketManager(WS_URL);

                wsManager.onEvent((message) => {
                    store.dispatch({ type: WS_RECEIVED, payload: message });
                });

                wsManager.ready.then(() => {
                    store.dispatch({ type: WS_CONNECTED });
                });
            }
            
            const response = await wsManager.send(action.payload);
            // console.log('WebSocket response:', response);
            store.dispatch({ type: WS_RECEIVED, payload: response }); // Optional
            break;

        default:
            return next(action);
    }
};

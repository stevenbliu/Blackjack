import { WS_RECEIVED, WS_CHAT_MESSAGE_RECEIVED } from './actionTypes';
import { setGameRooms, setSocketError } from '../lobby/lobbySlice';
export const wsResponseMiddleware = (store) => (next) => (action) => {
    if (typeof action === 'object' && action !== null && 'type' in action && action.type === WS_RECEIVED) {
        const message = action.payload;
        switch (message.action) {
            case 'chat_message':
                store.dispatch({
                    type: WS_CHAT_MESSAGE_RECEIVED,
                    payload: {
                        id: message.id,
                        from: message.from,
                        to: message.to,
                        content: message.content,
                        timestamp: message.timestamp,
                        type: message.type,
                    },
                });
                break;
            case 'lobby_update':
                store.dispatch(setGameRooms({
                    games: message.games,
                    currentPage: message.currentPage || 1,
                    totalPages: message.totalPages || 1,
                }));
                break;
            case 'error':
                if (message.error) {
                    store.dispatch(setSocketError(message.error));
                }
                break;
        }
    }
    return next(action);
};

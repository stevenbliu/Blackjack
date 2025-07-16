import { Middleware } from '@reduxjs/toolkit';
import { WS_RECEIVED } from './actionTypes';
import { setGameRooms, setSocketError } from '../lobby/lobbySlice';

export const wsResponseMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === WS_RECEIVED) {
    const message = action.payload;
    console.log("Message:", message)

    switch (message.action) {
        case 'lobby_update':
        store.dispatch(
            setGameRooms({
            games: message.games,
            currentPage: message.currentPage || 1,
            totalPages: message.totalPages || 1,
            })
        );
        break;

      case 'error':
        if (message.error) {
          store.dispatch(setSocketError(message.error));
        } else {
          console.warn('Received error message without error payload');
        }
        break;

      // You can handle other message types here

      default:
        break;
    }
  }

  return next(action);
};

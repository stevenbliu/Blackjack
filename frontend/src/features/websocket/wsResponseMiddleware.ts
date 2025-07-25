import { Middleware } from '@reduxjs/toolkit';
import {
  WS_RECEIVED,
  WS_CHAT_MESSAGE_RECEIVED,
  SEND_WS_MESSAGE,
  WS_ERROR,
} from './types/actionTypes';
import { setGameRooms, setSocketError } from '../lobby/lobbySlice';

type Resolver = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeoutId: number;
};

const pendingRequests: Record<string, Resolver> = {};

export const socketResponseMiddleware: Middleware = (store) => (next) => (action: any) => {
  if (action.type === SEND_WS_MESSAGE) {
    const payload = action.payload;
    const messageId = payload?.requestId || payload?.messageId;

    if (messageId) {
      return new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          delete pendingRequests[messageId];
          reject(new Error('Socket.IO request timed out'));
        }, 10000);

        pendingRequests[messageId] = { resolve, reject, timeoutId };

        next(action); // Let it go to the socketMiddleware
      });
    }
  }

  if (action.type === WS_RECEIVED) {
    const message = action.payload;
    const messageId = message?.requestId || message?.messageId;

    if (messageId && pendingRequests[messageId]) {
      const { resolve, reject, timeoutId } = pendingRequests[messageId];
      clearTimeout(timeoutId);
      delete pendingRequests[messageId];

      if (message.success === false) {
        reject(new Error(message.error || 'Unknown error'));
      } else {
        resolve(message);
      }
    }

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

      case 'game_created':
        store.dispatch({
          type: 'WS_GAME_CREATED',
          payload: {
            gameId: message.gameId,
            requestId: message.requestId,
            success: message.success,
          },
        });
        break;

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
        }
        break;
    }
  }

  if (action.type === WS_ERROR) {
    Object.values(pendingRequests).forEach(({ reject, timeoutId }) => {
      clearTimeout(timeoutId);
      reject(new Error(action.payload?.message || 'Socket error'));
    });
    Object.keys(pendingRequests).forEach((key) => delete pendingRequests[key]);
  }

  return next(action);
};

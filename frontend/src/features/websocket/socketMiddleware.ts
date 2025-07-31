import { Middleware } from '@reduxjs/toolkit';
import socketService  from './socketServiceSingleton';
import { SEND_WS_MESSAGE } from './types/actionTypes';
import { RootState } from '../app/store';

export const socketMiddleware: Middleware<{}, RootState> = (store) => {
  return (next) => (action) => {
    if (action.type === SEND_WS_MESSAGE) {
      try {
        socketService.send(action.payload);
      } catch (error) {
        console.error('WebSocket send error:', error);
        store.dispatch({
          type: WS_RECEIVED,
          payload: {
            action: "error",
            payload: {
              code: "SEND_FAILED",
              message: "Failed to send message",
              originalError: error,
            },
            namespace: action.payload.namespace
          },
        });
      }
    }
    return next(action);
  };
};
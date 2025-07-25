import { Middleware } from '@reduxjs/toolkit';
import { SocketIOManager } from './wsManager';
import { SEND_WS_MESSAGE, WS_RECEIVED } from './types/actionTypes';
import { AppDispatch, RootState } from '../../app/store';
import { SocketMessage } from './types/socketTypes';

interface WSAction {
  type: typeof SEND_WS_MESSAGE;
  payload: SocketMessage;
}

export const socketMiddleware: Middleware<{}, RootState> = (store) => {
  const socket = SocketIOManager.getInstance();
  const { dispatch } = store;

  // Initialize connection
  const initSocket = () => {
    const token = localStorage.getItem('token') || 'temp-token';
    
    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    // Handle all incoming messages through WS_RECEIVED action
    socket.on('message', (message: SocketMessage) => {
      dispatch({
        type: WS_RECEIVED,
        payload: message
      });
    });

    socket.connect(token).catch((err) => {
      console.error('Initial connection failed:', err);
    });
  };

  // Initialize on first run
  // if (typeof window !== 'undefined') {
  //   console.log('123');
  //   initSocket();
  //   console.log('123');
  // }

  return (next) => async (action: WSAction) => {
    // Handle outgoing messages
    if (action.type === SEND_WS_MESSAGE) {
      try {
        await socket.send(action.payload);
      } catch (error) {
        console.error('WebSocket send error:', error);
        // Dispatch error to store if needed
        dispatch({
          type: WS_RECEIVED,
          payload: {
            action: 'error',
            payload: {
              code: 'SEND_FAILED',
              message: 'Failed to send message',
              originalError: error
            }
          }
        });
      }
    }

    return next(action);
  };
};
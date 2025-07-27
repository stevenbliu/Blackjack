import { Middleware } from '@reduxjs/toolkit';
import { SocketIOManager } from './wsManager';
import { SEND_WS_MESSAGE, WS_RECEIVED } from './types/actionTypes';
import { RootState } from '../../app/store';
import { SocketMessage } from './types/socketTypes';

interface WSAction {
  type: typeof SEND_WS_MESSAGE;
  payload: SocketMessage;
}

const socket = SocketIOManager.getInstance();

// Exportable init function
export const initSocket = () => {
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

  // Handle incoming messages
  socket.on('message', (message: SocketMessage) => {
    storeDispatch({
      type: WS_RECEIVED,
      payload: message
    });
  });

  socket.connect(token).catch((err) => {
    console.error('Initial connection failed:', err);
  });
};

// Capture dispatch to use in the above initSocket
let storeDispatch: any;

export const socketMiddleware: Middleware<{}, RootState> = (store) => {
  storeDispatch = store.dispatch;

  return (next) => async (action: WSAction) => {
    if (action.type === SEND_WS_MESSAGE) {
      try {
        await socket.send(action.payload);
      } catch (error) {
        console.error('WebSocket send error:', error);
        store.dispatch({
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

export default socketMiddleware;

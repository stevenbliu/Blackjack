import { Middleware } from '@reduxjs/toolkit';
import { SocketIOManager } from './wsManager';
import { SEND_WS_MESSAGE, WS_RECEIVED } from './types/actionTypes';
import { RootState } from '../../app/store';
import { SocketMessage } from './types/socketTypes';

interface WSAction {
  type: typeof SEND_WS_MESSAGE;
  payload: SocketMessage;
}

export const socket = SocketIOManager.getInstance();

// Exportable init function
export async function initSocket(token?: string, namespace?: string) {
  if (!token) return;

  if (namespace) socket.setNamespace(namespace);

  if (socket.getConnectionState() === 'connected') {
    await socket.disconnect();
  }

  // const token2 = store.getState().auth.token;
  // console.log("B3" + token2);
  console.log("tk before connect" + token);
  await socket.connect(token);

  // Register default namespace handler
  socket.registerNamespace("/", (message) => {
    storeDispatch({
      type: WS_RECEIVED,
      payload: message
    });
  });

  // Register chat namespace handler
  socket.registerNamespace("/chat", (message) => {
    storeDispatch({
      type: WS_RECEIVED,
      payload: { ...message, namespace: "/chat" }
    });
  });

  // Register game namespace handler
  socket.registerNamespace("/game", (message) => {
    storeDispatch({
      type: WS_RECEIVED,
      payload: { ...message, namespace: "/game" }
    });
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
  });

  if (token) {
    socket.updateAuthToken(token);
    await socket.connect();
    console.log("Connected to the WS");
  }

  return socket;
};

// Capture dispatch to use in the above initSocket
let storeDispatch: any;

export const socketMiddleware: Middleware<{}, RootState> = (store) => {
  storeDispatch = store.dispatch;

  return (next) => async (action: WSAction) => {
    if (action.type === SEND_WS_MESSAGE) {
      try {
        await socket.send({
          type: 'message type',
          payload: action.payload,
          namespace: action.payload.namespace || "/"
        });
      } catch (error) {
        console.error(
          'WebSocket send error:',
          error,
          'Payload:',
          JSON.stringify(action.payload, null, 2)
        );
        store.dispatch({
          type: WS_RECEIVED,
          payload: {
            action: "error",
            payload: {
              code: "SEND_FAILED",
              message: "Failed to send message",
              originalError: error,
            },
            namespace: action.payload.namespace || "/"
          },
        });
      }
    }

    return next(action);
  };
};

export default socketMiddleware;
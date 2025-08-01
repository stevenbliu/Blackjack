import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import gameReducer from '../features/game/gameSlice';
import lobbyReducer from '../features/lobby/lobbySlice';
import chatReducer from '../features/chat/chatSlice';
import playerReducer from '../features/player/playerSlice';
import errorReducer from '../features/error/errorSlice';
import websocketReducer from '../features/websocket/websocketSlice'
import tabletopReducer from '../features/Tabletop/tabletopSlice'

import { socketMiddleware } from '../features/websocket/socketMiddleware';
import { socketResponseMiddleware } from '../features/websocket/wsResponseMiddleware';

import authReducer from '../features/auth/authSlice'
import { authApi } from '../features/auth/api/authApi'; // Import your API slice
import { chatApi } from '../features/chat/api/chatApi'; // Import your API slice

export const store: any = configureStore({
  reducer: {
    game: gameReducer,
    lobby: lobbyReducer,
    chat: chatReducer,
    player: playerReducer,
    error: errorReducer,
    websocket: websocketReducer,
    tabletop: tabletopReducer,
    [authApi.reducerPath]: authApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    // Add other reducers here, e.g., [authApi.reducerPath]: authApi.reducer, 
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      chatApi.middleware,
      socketMiddleware,
      socketResponseMiddleware
    ),
});

// Typed types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

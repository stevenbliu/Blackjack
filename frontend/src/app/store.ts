import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../features/game/gameSlice';
import lobbyReducer from '../features/lobby/lobbySlice';
import { websocketMiddleware } from '../features/websocket/websocketMiddleware';
import { wsResponseMiddleware } from '../features/websocket/wsResponseMiddleware';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    lobby: lobbyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(websocketMiddleware, wsResponseMiddleware),
});

// Typed types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

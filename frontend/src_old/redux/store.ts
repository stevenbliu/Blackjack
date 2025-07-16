import { configureStore } from '@reduxjs/toolkit';
import lobbyReducer from './slices/lobbySlice';
import gameReducer from './slices/gameSlice';
import { websocketMiddleware } from '../websockets/wsMiddleware'; // adjust path

export const store = configureStore({
  reducer: {
    lobby: lobbyReducer,
    game: gameReducer,
    // add other slices here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(websocketMiddleware),
});

// Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

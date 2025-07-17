import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import gameReducer from '../features/game/gameSlice';
import lobbyReducer from '../features/lobby/lobbySlice';
import chatReducer from '../features/chat/chatSlice';
import playerReducer from '../features/player/playerSlice';
import errorReducer from '../features/error/errorSlice';
import { websocketMiddleware } from '../features/websocket/websocketMiddleware';
import { wsResponseMiddleware } from '../features/websocket/wsResponseMiddleware';
export const store = configureStore({
    reducer: {
        game: gameReducer,
        lobby: lobbyReducer,
        chat: chatReducer,
        player: playerReducer,
        error: errorReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(websocketMiddleware, wsResponseMiddleware),
});
// Typed hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

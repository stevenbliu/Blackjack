// lobbyThunks.ts

import { SEND_WS_MESSAGE } from '../../websockets/actionTypes';
import { startLoading, startCreating } from './lobbySlice';
import type { AppDispatch } from '../store';

// Action creator: subscribe to lobby updates
export const initLobby = () => (dispatch: AppDispatch) => {
  dispatch({
    type: SEND_WS_MESSAGE,
    payload: { action: 'subscribe', room: 'lobby' }, // changed `type` → `action` for consistency
  });
};

// Action creator: fetch current room list
export const fetchRooms = () => (dispatch: AppDispatch) => {
  dispatch(startLoading());
  dispatch({
    type: SEND_WS_MESSAGE,
    payload: { action: 'lobby' }, // changed `type: 'fetch_rooms'` → `action: 'lobby'` to match backend naming
  });
};

// Action creator: create a new game
export const createGame = (playerId: string) => (dispatch: AppDispatch) => {
  dispatch(startCreating());
  dispatch({
    type: SEND_WS_MESSAGE,
    payload: { action: 'create_game', playerId },
  });
};

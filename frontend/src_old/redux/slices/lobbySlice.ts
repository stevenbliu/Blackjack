// redux/slices/lobbySlice.ts
import { createSlice, createAsyncThunk, PayloadAction, AnyAction } from '@reduxjs/toolkit';
import { SEND_WS_MESSAGE, WS_RECEIVED } from '../../websockets/actionTypes';
import type { AppDispatch, RootState } from '../store';

interface GameRoom {
  game_id: string;
  players: { id: string }[];
  max_players: number;
}

interface LobbyState {
  gameRooms: GameRoom[];
  loading: boolean;
  creating: boolean;
  socketError: string | null;
}

const initialState: LobbyState = {
  gameRooms: [],
  loading: false,
  creating: false,
  socketError: null,
};

// --- Async Thunks ---

export const createGame = createAsyncThunk<
  void,
  string, // playerId
  { dispatch: AppDispatch }
>('lobby/createGame', async (playerId, { dispatch }) => {
  dispatch({
    type: SEND_WS_MESSAGE,
    payload: { action: 'create_game', playerId },
  });
});

export const fetchRooms = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch }
>('lobby/fetchRooms', async (_, { dispatch }) => {
  dispatch({
    type: SEND_WS_MESSAGE,
    payload: { action: 'lobby' },
  });
});

export const initLobby = createAsyncThunk<
  void,
  void,
  { dispatch: AppDispatch }
>('lobby/initLobby', async (_, { dispatch }) => {
  dispatch(fetchRooms());
});

// --- Slice ---

const lobbySlice = createSlice({
  name: 'lobby',
  initialState,
  reducers: {
    setGameRooms: (state, action: PayloadAction<GameRoom[]>) => {
      state.gameRooms = action.payload;
    },
    setSocketError: (state, action: PayloadAction<string | null>) => {
      state.socketError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRooms.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createGame.pending, (state) => {
        state.creating = true;
      })
      .addCase(createGame.fulfilled, (state) => {
        state.creating = false;
      })
      .addMatcher(
        // Handle custom socket action
        (action: AnyAction) => action.type === WS_RECEIVED,
        (state, action: AnyAction) => {
          const msg = action.payload;

          if (msg?.action === 'lobby_update') {
            state.gameRooms = msg.games || [];
          }

          if (msg?.action === 'error') {
            state.socketError = msg.error || 'Unknown socket error';
          }
        }
      );
  },
});

// --- Exports ---

export const { setGameRooms, setSocketError } = lobbySlice.actions;
export default lobbySlice.reducer;

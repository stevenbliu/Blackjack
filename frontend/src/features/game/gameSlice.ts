import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WebSocketMessage } from '../websocket/wsManager';
import { sendWsMessage } from '../websocket/websocketAPI'; // hypothetical helper to send WS msg

interface Card {
  rank: string;
  suit: string;
  name: string;
  CardName: string;
}

interface PlayerResult {
  result: 'win' | 'loss' | 'draw' | 'bust' | string;
  player_index: number;
  score: number;
}

interface GameState {
  gameId: string | null;
  playersHands: Card[][];
  dealerHand: Card[];
  result: PlayerResult[] | string | null;
  gameOver: boolean;
  message: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: GameState = {
  gameId: null,
  playersHands: [],
  dealerHand: [],
  result: null,
  gameOver: false,
  message: null,
  loading: false,
  error: null,
};

// Async thunk helpers, replace with your actual WS or API calls:

export const startGame = createAsyncThunk(
  'game/startGame',
  async (_, thunkAPI) => {
    const response = await sendWsMessage({ action: 'start_game' });
    return response; // expected: { gameId, playersHands, dealerHand, message }
  }
);

export const hit = createAsyncThunk(
  'game/hit',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as { game: GameState };
    const gameId = state.game.gameId;
    const response = await sendWsMessage({ action: 'hit', gameId });
    return response; // updated game state
  }
);

export const stand = createAsyncThunk(
  'game/stand',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as { game: GameState };
    const gameId = state.game.gameId;
    const response = await sendWsMessage({ action: 'stand', gameId });
    return response;
  }
);

export const restartGame = createAsyncThunk(
  'game/restartGame',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as { game: GameState };
    const gameId = state.game.gameId;
    const response = await sendWsMessage({ action: 'restart_game', gameId });
    return response;
  }
);

export const joinGame = createAsyncThunk(
  'game/joinGame',
  async (params: { gameId: string; playerId: string }, thunkAPI) => {
    const response = await sendWsMessage({ 
      action: 'join_game', 
      gameId: params.gameId, 
      playerId: params.playerId 
    });
    return response;
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameId(state, action: PayloadAction<string | null>) {
      state.gameId = action.payload;
    },
    setPlayersHands(state, action: PayloadAction<Card[][]>) {
      state.playersHands = action.payload;
    },
    setDealerHand(state, action: PayloadAction<Card[]>) {
      state.dealerHand = action.payload;
    },
    setResult(state, action: PayloadAction<PlayerResult[] | string | null>) {
      state.result = action.payload;
      state.gameOver = action.payload !== null;
    },
    setMessage(state, action: PayloadAction<string | null>) {
      state.message = action.payload;
    },
    resetGame(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: builder => {
    // Example for startGame
    builder
      .addCase(startGame.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startGame.fulfilled, (state, action) => {
        state.loading = false;
        state.gameId = action.payload.gameId;
        state.playersHands = action.payload.playersHands;
        state.dealerHand = action.payload.dealerHand;
        state.message = action.payload.message;
        state.gameOver = false;
      })
      .addCase(startGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to start game';
      });

    // Repeat similar for hit, stand, restartGame, joinGame
    builder
      .addCase(hit.fulfilled, (state, action) => {
        // Update state based on server response
        Object.assign(state, action.payload);
      })
      .addCase(stand.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(restartGame.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(joinGame.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  },
});

export const {
  setGameId,
  setPlayersHands,
  setDealerHand,
  setResult,
  setMessage,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;

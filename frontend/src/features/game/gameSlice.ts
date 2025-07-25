import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Use these to update state when middleware receives socket events
    gameStarted(state, action: PayloadAction<Partial<GameState>>) {
      const payload = action.payload;
      state.gameId = payload.gameId ?? state.gameId;
      state.playersHands = payload.playersHands ?? state.playersHands;
      state.dealerHand = payload.dealerHand ?? state.dealerHand;
      state.message = payload.message ?? null;
      state.gameOver = false;
      state.loading = false;
      state.error = null;
      state.result = null;
    },
    gameUpdated(state, action: PayloadAction<Partial<GameState>>) {
      const payload = action.payload;
      state.playersHands = payload.playersHands ?? state.playersHands;
      state.dealerHand = payload.dealerHand ?? state.dealerHand;
      state.message = payload.message ?? state.message;
      state.result = payload.result ?? state.result;
      state.gameOver = payload.gameOver ?? state.gameOver;
    },
    gameEnded(state, action: PayloadAction<{ result: PlayerResult[] | string | null; message?: string | null }>) {
      state.result = action.payload.result;
      state.gameOver = true;
      if (action.payload.message !== undefined) {
        state.message = action.payload.message;
      }
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    resetGame(state) {
      Object.assign(state, initialState);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const {
  gameStarted,
  gameUpdated,
  gameEnded,
  setError,
  resetGame,
  setLoading,
} = gameSlice.actions;

export default gameSlice.reducer;

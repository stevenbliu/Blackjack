import { createSlice } from '@reduxjs/toolkit';

interface GameState {
  gameId: string | null;
  playerHands: any[];
  dealerHand: any[];
  gameOver: boolean;
  message: string | null;
}

const initialState: GameState = {
  gameId: null,
  playerHands: [],
  dealerHand: [],
  gameOver: false,
  message: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameId: (state, action) => {
      state.gameId = action.payload;
    },
    updateGameState: (state, action) => {
      Object.assign(state, action.payload); // assumes shape matches
    },
  },
});

export const { setGameId, updateGameState } = gameSlice.actions;
export default gameSlice.reducer;

// playerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  playerId: string | null;
}

const initialState: PlayerState = {
  playerId: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayerId: (state, action: PayloadAction<string>) => {
      state.playerId = action.payload;
    },
  },
});

export const { setPlayerId } = playerSlice.actions;
export default playerSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const playerSlice = createSlice({
  name: 'player',
  initialState: { playerId: null as string | null },
  reducers: {
    setPlayerId: (state, action) => {
      state.playerId = action.payload;
    },
  },
});

export const { setPlayerId } = playerSlice.actions;
export default playerSlice.reducer;

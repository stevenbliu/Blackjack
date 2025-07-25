import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WS_RECEIVED } from './types/actionTypes';
import { SocketMessage } from './types/socketTypes'; // You can rename this file if you switch to socketIOManager

interface WebsocketState {
  messages: SocketMessage[];
}

const initialState: WebsocketState = {
  messages: [],
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(WS_RECEIVED as string, (state, action: PayloadAction<SocketMessage>) => {
      state.messages.push(action.payload);
      if (state.messages.length > 50) state.messages.shift();
    });
  },
});

export default websocketSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WS_RECEIVED } from './actionTypes';
import { WebSocketMessage } from './wsManager';

interface WebsocketState {
  messages: WebSocketMessage[];
}

const initialState: WebsocketState = {
  messages: [],
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(WS_RECEIVED, (state, action: PayloadAction<WebSocketMessage>) => {
      state.messages.push(action.payload);
      // Optional: limit stored messages to last 50 or so
      if (state.messages.length > 50) state.messages.shift();
    });
  },
});

export default websocketSlice.reducer;

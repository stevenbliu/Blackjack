// chatSlice.ts
import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import { WS_CHAT_MESSAGE_RECEIVED } from '../websocket/types/actionTypes';
import { ChatMessagePayload, ChatEvents } from './socketEvents';
import { ChatMessage } from "./dataTypes";

// chatSlice.ts

type ChatType = 'lobby' | 'game' | 'private';



type ChatState = {
  messagesByContext: {
    [roomId: string]: ChatMessage[];
  };
  roomId: string; // e.g. "lobby" or "game-123"
};

const initialState: ChatState = {
  messagesByContext : {},
  roomId: 'lobby', // e.g. "lobby" or "game-123"
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setRoomId(state, action: PayloadAction<string>) {
      state.roomId = action.payload;
    },
    addMessage(state, action: PayloadAction<ChatMessagePayload>) {
      const {
        room_id = 'chat_lobby',
        user_id,
        username,
        message,
        timestamp,
      } = action.payload;

      const chatMessage: ChatMessage = {
        id: crypto.randomUUID(), // Or whatever ID scheme you prefer
        user_id: user_id,
        text: message,
        timestamp: typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp,
      };

      if (!state.messagesByContext[room_id]) {
        state.messagesByContext[room_id] = [];
      }

      state.messagesByContext[room_id].push(chatMessage);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      createAction<ChatMessage>(WS_CHAT_MESSAGE_RECEIVED),
      (state, action) => {
        const { id, senderId, text, timestamp } = action.payload;

        let target = 'lobby';
        if (type === 'private' && to) {
          target = (state.roomId === user_id) ? user_id : to;
        } else if (type === 'game') {
          target = 'game'; // or your game room id
        } else {
          target = 'lobby';
        }

        if (!state.messagesByContext[target]) {
          state.messagesByContext[target] = [];
        }

        state.messagesByContext[target].push(action.payload);

        // Optional: sort by timestamp ascending
        state.messagesByContext[target].sort((a, b) => a.timestamp - b.timestamp);
      }
    );
  },
});

export const { setRoomId, addMessage } = chatSlice.actions;
export default chatSlice.reducer;

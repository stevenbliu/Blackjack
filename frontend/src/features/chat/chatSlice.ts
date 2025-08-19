// chatSlice.ts
import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import { WS_CHAT_MESSAGE_RECEIVED } from '../websocket/types/actionTypes';
import { ChatMessagePayload } from './socketEvents';
import { ChatMessage } from "./dataTypes";

// chatSlice.ts

// type ChatType = 'lobby' | 'game' | 'private';


const initialRoom = 'chat_lobby'

type ChatState = {
  messagesByContext: {
    [roomId: string]: ChatMessage[];
  };
  roomId: string; // e.g. "lobby" or "game-123"
};

const initialState: ChatState = {
  messagesByContext : {},
  roomId: initialRoom, // e.g. "lobby" or "game-123"
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setRoomId(state, action: PayloadAction<string>) {
      state.roomId = action.payload;
    },
    addMessage(state, action: PayloadAction<ChatMessagePayload>) {
      const { room_id, user_id, username, message, timestamp, type} =
        action.payload;

      const chatMessage: ChatMessage = {
        id: crypto.randomUUID(), // Or whatever ID scheme you prefer
        user_id: user_id,
        message: message,
        timestamp: timestamp,
        type: type, // You can define othertypes if needed
        room_id: room_id,
        username: username,
      };

      if (!state.messagesByContext[room_id]) {
        state.messagesByContext[room_id] = [];
      }
      console.log(`addMessage: chatMessage ${chatMessage} pushed to room_id: ${room_id}`);
      // Add the new message to the room's message list
      state.messagesByContext[room_id].push(chatMessage);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      createAction<ChatMessage>(WS_CHAT_MESSAGE_RECEIVED),
      (state, action) => {
        console.log(`Extra Reducer: chatMessage ${action.payload} pushed to room_id: ${state.roomId}`);
        state.messagesByContext[state.roomId].push(action.payload);
        // const { id, senderId, text, timestamp, user_id } = action.payload;

        // let target = initialRoom;
        // if (type === 'private' && to) {
        //   target = (state.roomId === user_id) ? user_id : 'none';
        // } else if (type === 'game') {
        //   target = 'game'; // or your game room id
        // } else {
        //   target = initialRoom;
        // }

        // if (!state.messagesByContext[target]) {
        //   state.messagesByContext[target] = [];
        // }
        // console.log(`Extra Reducer: chatMessage ${action.payload} pushed to room_id: ${target}`);
        // state.messagesByContext[target].push(action.payload);

        // // Optional: sort by timestamp ascending
        // state.messagesByContext[target].sort((a, b) => a.timestamp - b.timestamp);
      }
    );
  },
});

export const { setRoomId, addMessage } = chatSlice.actions;
export {initialRoom}
export default chatSlice.reducer;

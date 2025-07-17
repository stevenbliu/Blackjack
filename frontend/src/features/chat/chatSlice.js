// chatSlice.ts
import { createSlice, createAction } from '@reduxjs/toolkit';
import { WS_CHAT_MESSAGE_RECEIVED } from '../websocket/actionTypes';
const initialState = {
    messagesByUser: {
        lobby: [],
    },
    currentChatTarget: 'lobby',
};
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setCurrentChatTarget(state, action) {
            state.currentChatTarget = action.payload;
        },
        addOutgoingMessage(state, action) {
            const target = action.payload.to ?? 'lobby';
            if (!state.messagesByUser[target]) {
                state.messagesByUser[target] = [];
            }
            state.messagesByUser[target].push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(createAction(WS_CHAT_MESSAGE_RECEIVED), (state, action) => {
            const { from, to, type } = action.payload;
            let target = 'lobby';
            if (type === 'private' && to) {
                // Determine which user chat this message belongs to
                // If the current chat is with 'from', message belongs to 'from'
                // Otherwise, message belongs to 'to'
                target = (state.currentChatTarget === from) ? from : to;
            }
            else if (type === 'game') {
                // Handle game chat target logic here if needed
                target = 'game'; // or some game id or group key
            }
            else {
                target = 'lobby';
            }
            if (!state.messagesByUser[target]) {
                state.messagesByUser[target] = [];
            }
            state.messagesByUser[target].push(action.payload);
            // Optional: sort by timestamp ascending
            state.messagesByUser[target].sort((a, b) => a.timestamp - b.timestamp);
        });
    },
});
export const { setCurrentChatTarget, addOutgoingMessage } = chatSlice.actions;
export default chatSlice.reducer;

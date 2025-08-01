// websocket/types/actionTypes.ts
export const WS_CHAT_MESSAGE_RECEIVED = 'websocket/chatMessageReceived';

// websocket/actions.ts
import { createAction } from '@reduxjs/toolkit';
import { ChatMessage } from '../../features/chat/chatSlice';

export const wsChatMessageReceived = createAction<ChatMessage>(WS_CHAT_MESSAGE_RECEIVED);

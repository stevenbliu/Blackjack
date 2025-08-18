// hooks/useChatManager.ts
import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../app/store';
import { addMessage } from '../chatSlice';
import socketService  from '../../websocket/socketServiceSingleton';
import { ChatEvents } from '../socketEvents';
import { ChatMessage } from "../dataTypes";
import { NamespacePayload } from "../../websocket/types/socketTypes";

export function useChatManager() {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state: RootState) => state.auth.userId);
  const currentUsername = useSelector((state: RootState) => state.auth.username);
  const roomId = useSelector((state: RootState) => state.chat.roomId);
  const messagesByContext = useSelector((state: RootState) => state.chat.messagesByContext);

  const [newMessage, setNewMessage] = useState('');

  const sendMessage = useCallback(() => {
    const trimmed = newMessage.trim();
    if (!trimmed || !currentUserId || !currentUsername) return;

    const msgType = roomId === 'lobby' || roomId === 'game' ? roomId : 'private';
    // const to = msgType === 'private' ? roomId : undefined;

    const payload: NamespacePayload<ChatMessage> = {
      event: 'message',
      data: {
        id: crypto.randomUUID(),
        user_id: currentUserId,
        username: currentUsername,
        message: trimmed,
        timestamp: Date.now(),
        type: msgType,
        room_id: roomId
      }
    };

    const response = socketService.sendToNamespace( 'chat',  payload );

    // dispatch(addMessage(payload.data));
    setNewMessage('');
  }, [newMessage, roomId, currentUserId, currentUsername, dispatch]);

  return {
    newMessage,
    setNewMessage,
    sendMessage,
    roomId,
    messagesByContext,
  };
}

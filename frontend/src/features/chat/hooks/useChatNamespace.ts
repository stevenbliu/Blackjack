import { useEffect } from 'react';
import  socketService from '../../websocket/socketServiceSingleton';
import {
  ChatEvents,
  JoinRoomPayload,
  ChatMessagePayload,
  SendChatMessagePayload,
} from '../socketEvents';
import { addMessage } from '../chatSlice';
import { useAppDispatch } from '../../..//app/hooks'; // or however your hooks are structured


export function useChatNamespace(
  roomId: string | null,
  currentUserId: string,
  currentUsername: string,
  onMessage?: (msg: ChatMessagePayload) => void
): {
  sendMessage: (msg: SendChatMessagePayload) => void;
} {

  const dispatch = useAppDispatch();

  useEffect(() => {
  if (!roomId || !currentUserId || !currentUsername) return;

  const joinPayload: JoinRoomPayload = {
    room_id: roomId,
    user_id: currentUserId,
    username: currentUsername,
  };

  let chatSocket: Awaited<ReturnType<typeof socketService.addNamespace>> | null = null;

  const messageHandler =
    onMessage ||
    ((msg: ChatMessagePayload) => {
      console.log('[Namespace] Received message:', msg);
      dispatch(addMessage(msg));
    });

  const connectAndJoin = async () => {
    try {
      chatSocket = await socketService.addNamespace('/chat');

      chatSocket.off(ChatEvents.MESSAGE); // 👈 clean up previous handlers
      chatSocket.off(ChatEvents.NEW_MESSAGE);

      chatSocket.on(ChatEvents.MESSAGE, messageHandler);
      chatSocket.on(ChatEvents.NEW_MESSAGE, messageHandler);

      chatSocket.emit(ChatEvents.JOIN_ROOM, {
        room_id: 'lobby',
        user_id: currentUserId,
        username: currentUsername,
      });

      chatSocket.emit(ChatEvents.JOIN_ROOM, joinPayload);
    } catch (err) {
      console.error('❌ Failed to connect to /chat namespace:', err);
    }
  };

  connectAndJoin();

  return () => {
    if (chatSocket) {
      chatSocket.off(ChatEvents.MESSAGE, messageHandler);
      chatSocket.off(ChatEvents.NEW_MESSAGE, messageHandler);
      chatSocket.emit(ChatEvents.LEAVE_ROOM, {
        room_id: roomId,
        user_id: currentUserId,
      });
    }
  };
}, [roomId, currentUserId, currentUsername]);

  // Optionally get the socket again here when sending
  const sendMessage = (msg: SendChatMessagePayload) => {
    const socket = socketService.getNamespace('/chat');
    // const socket = null;
    if (!socket) {
      console.warn('❌ No socket available for /chat namespace');
      return;
    }
    socket.emit(ChatEvents.MESSAGE, msg);
  };

  return { sendMessage };
}

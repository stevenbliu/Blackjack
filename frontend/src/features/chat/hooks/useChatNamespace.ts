import { useEffect, useCallback } from 'react';
import socketService from '../../websocket/socketServiceSingleton';
import {
  ChatEvents,
  JoinRoomPayload,
  ChatMessagePayload,
  // SendChatMessagePayload,
} from '../socketEvents';
import { addMessage, initialRoom } from '../chatSlice';
import { useAppDispatch } from '../../../app/hooks';
// import { socket } from '@features/websocket/websocketMiddleware';

export function useChatNamespace(
  roomId: string | null,
  currentUserId: string,
  currentUsername: string,
  onMessage?: (msg: ChatMessagePayload) => void
) {
  const dispatch = useAppDispatch();

  // ✅ Memoized handler (shared reference for add/remove listeners)
  const messageHandler = useCallback(
    onMessage ||
      ((msg: ChatMessagePayload) => {
        console.log('[💬] Dispatching message:', msg);
        dispatch(addMessage(msg));
      }),
    [onMessage, dispatch]
  );

  useEffect(() => {
    if (!roomId || !currentUserId || !currentUsername) {
      console.log('⏸ Skipping useChatNamespace — missing inputs');
      return;
    }

    console.log('🔌 useChatNamespace initializing for', roomId);

    const joinPayload: JoinRoomPayload = {
      room_id: roomId,
      user_id: currentUserId,
      username: currentUsername,
    };

    let chatSocket: Awaited<ReturnType<typeof socketService.addNamespace>> | null = null;
    let isMounted = true;

    const connectAndJoin = async () => {
      try {
        chatSocket = await socketService.addNamespace('/chat');

        if (!isMounted || !chatSocket) return;

        // Remove any old listeners (with same handler)
        chatSocket.off(ChatEvents.MESSAGE, messageHandler);
        chatSocket.off(ChatEvents.NEW_MESSAGE, messageHandler);

        // Attach new listeners
        chatSocket.on(ChatEvents.MESSAGE, messageHandler);
        chatSocket.on(ChatEvents.NEW_MESSAGE, messageHandler);

        // Join rooms
        chatSocket.emit(ChatEvents.JOIN_ROOM, {
          room_id: initialRoom,
          user_id: currentUserId,
          username: currentUsername,
        });

        chatSocket.emit(ChatEvents.JOIN_ROOM, joinPayload);

        console.log('✅ Joined rooms:', initialRoom, roomId);
      } catch (err) {
        console.error('❌ Socket error:', err);
      }
    };

    connectAndJoin();

    return () => {
      isMounted = false;

      if (chatSocket) {
        console.log('🧹 Cleaning up socket for room:', roomId);
        chatSocket.off(ChatEvents.MESSAGE, messageHandler);
        chatSocket.off(ChatEvents.NEW_MESSAGE, messageHandler);
        chatSocket.emit(ChatEvents.LEAVE_ROOM, {
          room_id: roomId,
          user_id: currentUserId,
        });
      }
    };
  // }, [roomId, currentUserId, currentUsername, messageHandler]);
  }, []);

  // Send message via the current socket
  // const sendMessage = (msg: SendChatMessagePayload) => {
  //   console.log("[💬] Sending message:", msg);
  //   const payload = {
  //     event: ChatEvents.MESSAGE, 
  //     data: msg
  //   }
    
  //   socketService.sendToNamespace("/chat", payload);
  //   // const socket = socketService.getNamespace('/chat');
  //   // if (!socket) {
  //   //   console.warn('❌ No /chat socket available');
  //   //   return;
  //   // }

  //   // socket.emit(ChatEvents.MESSAGE, msg);
  // };

  // return { sendMessage };
  // return {};
}

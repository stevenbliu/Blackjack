// src/features/chat/hooks/useChatRoom.ts
import { useState, useEffect } from 'react';
import { useCreateRoomMutation, useJoinRoomMutation } from '../api/chatApi';

export function useChatRoom(currentUserId: string, currentUsername: string) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [createRoom] = useCreateRoomMutation();
  const [joinRoom] = useJoinRoomMutation();

  useEffect(() => {
    async function createAndJoin() {
      if (!currentUserId || !currentUsername || roomId) return;

      try {
        console.log("creating room");
        const createBody = {
          name: 'cool room',
          creator_id: currentUserId,
          max_participants: 4,
        };
        console.log("creating room", createBody);
        const createRes = await createRoom(createBody).unwrap();
        console.log("created room", createRes);
        setRoomId(createRes.room_id);
        console.log("setting state room id", createRes.room_id);

        await joinRoom({
          room_id: createRes.room_id,
          user_id: currentUserId,
          username: currentUsername,
        }).unwrap();
      } catch (err) {
        console.error('Failed to create/join room', err);
      }
    }
    createAndJoin();
  }, [createRoom, joinRoom, currentUserId, currentUsername, roomId]);

  return roomId;
}

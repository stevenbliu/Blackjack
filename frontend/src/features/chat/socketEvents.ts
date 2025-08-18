// src/features/chat/socketEvents.ts

export const ChatEvents = {
  JOIN_ROOM: 'join_room' as const,
  LEAVE_ROOM: 'leave_room' as const,
  MESSAGE: 'message' as const,
  NEW_MESSAGE: 'new_message' as const,
  ROOM_JOINED: 'room_joined' as const,
  ERROR: 'error' as const,
};

export type ChatEvent = typeof ChatEvents[keyof typeof ChatEvents];

export interface JoinRoomPayload {
  room_id: string;
  user_id: string;
  username: string;
}

export interface LeaveRoomPayload {
  room_id: string;
  user_id: string;
}


export interface SendChatMessagePayload {
  room_id: string;
  user_id: string;
  message: string;
  // other metadata like timestamp?
}

export interface ChatMessagePayload {
  id?: string;
  user_id: string;
  username: string;
  to?: string;
  message: string;
  timestamp: number | string;
  type?: 'lobby' | 'game' | 'private';
  messageStatus?: 'sent' | 'delivered' | 'read';
  room_id: string;
}

export interface RoomJoinedPayload {
  room_id: string;
}

export type ChatMessage = {
  id: string;
  user_id: string;
  message: string;
  timestamp: number | string;
  type: string;
  // is_bot: boolean;
  room_id: string;
  username: string;
};
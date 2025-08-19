// socketTypes.ts

// Base interface for all socket messages (can extend as needed)
export interface SocketMessage {
  // action: string;
  type: string;
  payload: string;
  message: string;
  // [key: string]: any;
}

// Events client sends to the server
export interface ClientToServerEvents {
  // General message event (if you use a generic 'message' channel)
  message: (msg: SocketMessage) => void;

  // Specific client events (can add as needed)
  request_player_id: () => void;
  start_game: () => void;
  hit: (gameId: string) => void;
  stand: (gameId: string) => void;
  restart_game: (gameId: string) => void;
  join_game: (params: { gameId: string; playerId: string }) => void;

  // Add other client-to-server emits here
}

// Events server sends to the client
export interface ServerToClientEvents {
  player_id: (data: { playerId: string }) => void;

  game_update: (data: SocketMessage) => void; // Replace `any` with your GameState type
  game_started: (data: SocketMessage) => void; 
  game_over: (data: SocketMessage) => void;

  // General message event if needed
  message: (msg: SocketMessage) => void;

  // Add other server-to-client events here
}

export interface NamespacePayload<T = SocketMessage> {
  event: string;
  data: T;
}

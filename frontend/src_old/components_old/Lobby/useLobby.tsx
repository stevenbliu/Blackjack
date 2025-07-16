import { useState } from "react";
import { useWebSocket, WebSocketMessage } from "../../websockets/wsContext";

type GameRoom = {
  game_id: string;
  players: any[]; // Consider typing players more specifically
  max_players: number;
};

export const useLobby = () => {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  const { connect, send, onEvent } = useWebSocket();

  const init = async () => {
    try {
      await connect();

      // Setup listeners only once
      onEvent((message: WebSocketMessage) => {
        switch (message.action) {
          case "error":
            setSocketError(message.error);
            break;
          case "lobby_update":
            setGameRooms(message.games || []);
            break;
          case "game_joined":
            console.log("Game joined:", message.gameId);
            break;
          default:
            console.warn("Unhandled message:", message);
        }
      });

      await fetchRooms(); // Initial lobby data
    } catch (err) {
      console.error("WebSocket connection failed:", err);
      setSocketError("Failed to connect to WebSocket server.");
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await send({ action: "lobby" });
      setGameRooms(response?.games || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setSocketError("Failed to fetch rooms.");
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (): Promise<string | null> => {
    try {
      setCreating(true);
      const response = await send({ action: "create_game" });
      return response?.gameId || null;
    } catch (error) {
      console.error("Error creating game:", error);
      setSocketError("Failed to create game.");
      return null;
    } finally {
      setCreating(false);
    }
  };

  const joinGame = async (gameId: string): Promise<void> => {
    try {
      await send({ action: "join_game", gameId });
    } catch (error) {
      console.error("Error joining game:", error);
      setSocketError("Failed to join game.");
    }
  };

  return {
    gameRooms,
    loading,
    creating,
    socketError,
    fetchRooms,
    createGame,
    joinGame,
    init,
  };
};

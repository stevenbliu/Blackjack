// File: useGame.tsx

import { useState } from 'react';
import { apiClient } from '../../utils/apiClient';
import { useWebSocket } from '../../websockets/wsContext';

interface Card {
  rank: string;
  suit: string;
  name: string;
  CardName: string;
}

interface PlayerResult {
  result: "win" | "loss" | "draw" | "bust" | string;
  player_index: number;
  score: number;
}

interface GameState {
  game_id: string;
  player_hands: Card[][];
  dealer_hand: Card[];
  result: PlayerResult[] | string;
  player_hand: Card[];
  dealer_score?: number;
  player_score?: number;
}

const useGame = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerHands, setPlayerHands] = useState<Card[][]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);

  const { send, onEvent } = useWebSocket();

  const handleError = (error: unknown, context: string) => {
    console.error(`${context} error:`, error);
    setMessage("Unable to contact the server. Please try again later.");
    setGameOver(true);
  };

  const startGame = async () => {
    try {
      console.log("Starting a new game...");
      const data = await apiClient('/create_game', 'POST');
      const newGameId = data.gameId;
      setGameId(newGameId);

      await apiClient('/join_game', 'POST', {
        game_id: newGameId,
        player_id: currentPlayer,
      });

      console.log("Joined game successfully");

      // WebSocket event handling
      onEvent((event: MessageEvent) => {
        try {
          const gameData: GameState = JSON.parse(event.data);
          setPlayerHands(gameData.player_hands || []);
          setDealerHand(gameData.dealer_hand);
          setMessage(typeof gameData.result === 'string' ? gameData.result : null);

          if (typeof gameData.result !== 'string') {
            setGameOver(true);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      });
    } catch (error) {
      handleError(error, "Start game");
    }
  };

  const joinGame = async (gameId: string, playerId: string) => {
    try {
      await apiClient('/join_game', 'POST', {
        game_id: gameId,
        player_id: playerId,
      });
      setGameId(gameId);
      console.log("Joined game successfully:", gameId);
    } catch (error) {
      handleError(error, "Join game");
    }
  };

  const sendActionToServer = (action: string) => {
    if (!gameId) {
      console.warn("No gameId set; can't send action.");
      return;
    }

    send({
      action,
      playerIndex: currentPlayer,
      gameId: gameId,
    });
  };

  const hit = () => sendActionToServer('hit');
  const stand = () => sendActionToServer('stand');

  const restartGame = () => {
    setGameId(null);
    setPlayerHands([]);
    setDealerHand([]);
    setMessage(null);
    setGameOver(false);
    setCurrentPlayer(0);
  };

  return {
    gameId,
    setGameId,
    playerHands,
    dealerHand,
    message,
    gameOver,
    startGame,
    hit,
    stand,
    restartGame,
    joinGame
  };
};

export default useGame;

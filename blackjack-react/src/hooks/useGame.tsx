// src/hooks/useGame.ts
import { useState } from 'react';

interface Card {
  rank: string;
  suit: string;
  name: string;
  CardName: string;
}

interface GameState {
  game_id: string;
  player_hand: Card[];
  dealer_hand: Card[];
  result?: string;
}

export const useGame = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const startGame = async () => {
    const res = await fetch('http://localhost:8000/start', { method: 'POST' });
    const data: GameState = await res.json();
    setGameId(data.game_id);
    setPlayerHand(data.player_hand);
    setDealerHand(data.dealer_hand);
    setMessage(null);
    setGameOver(false);
  };

  const hit = async () => {
    const res = await fetch(`http://localhost:8000/hit/${gameId}`, { method: 'POST' });
    const data: GameState = await res.json();
    setPlayerHand(data.player_hand);
    if (data.result === "player_bust") {
      setMessage("You busted! Game over.");
      setGameOver(true);
    } else {
      setMessage(null);
    }
  };

  const stand = async () => {
    const res = await fetch(`http://localhost:8000/stand/${gameId}`, { method: 'POST' });
    const data: GameState = await res.json();
    setDealerHand(data.dealer_hand);

    if (data.result === "player_bust") {
      setMessage("You busted! Dealer wins.");
    } else if (data.result === "dealer_bust") {
      setMessage("Dealer busted! You win.");
    } else if (data.result === "player_wins") {
      setMessage("You win!");
    } else if (data.result === "dealer_wins") {
      setMessage("Dealer wins!");
    } else {
      setMessage(null);
    }
    setGameOver(true);
  };

  const restartGame = () => {
    setGameId(null);
    setPlayerHand([]);
    setDealerHand([]);
    setMessage(null);
    setGameOver(false);
  };

  return {
    gameId,
    playerHand,
    dealerHand,
    message,
    gameOver,
    startGame,
    hit,
    stand,
    restartGame,
  };
};

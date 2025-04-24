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

const API_URL = (() => {
    if (import.meta.env.DEV === true) {  // Checking against string "true"
        console.log("Development mode detected. Using development API URL.");
        return import.meta.env.VITE_DEVELOPMENT_API_URL;
    } else if (import.meta.env.DEV === false) {  // Checking against string "false"
        console.log("Production mode detected. Using production API URL.");
        return import.meta.env.VITE_PRODUCTION_API_URL;
    } else {
        throw new Error(`API URL not set. Please check your environment variables. DEV Enabled: ${import.meta.env.DEV}`);
    }
})();

const useGame = () => {
    const [gameId, setGameId] = useState<string | null>(null);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const handleError = (error: unknown, context: string) => {
        console.error(`${context} error:`, error);
        setMessage("Unable to contact the server. Please try again later.");
        setGameOver(true);
    };

    const startGame = async () => {
        try {
            console.log("Starting game...");
            console.log(`API URL: ${API_URL}`);
            const res = await fetch(`${API_URL}/start`, { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: GameState = await res.json();
            setGameId(data.game_id);
            setPlayerHand(data.player_hand);
            setDealerHand(data.dealer_hand);
            setMessage(null);
            setGameOver(false);
        } catch (error) {
            handleError(error, "Start game");
        }
    };

    const hit = async () => {
        try {
            const res = await fetch(`${API_URL}/hit/${gameId}`, { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: GameState = await res.json();
            setPlayerHand(data.player_hand);
            if (data.result === "player_bust") {
                setMessage("You busted! Game over.");
                setGameOver(true);
            } else {
                setMessage(null);
            }
        } catch (error) {
            handleError(error, "Hit");
        }
    };

    const stand = async () => {
        try {
            const res = await fetch(`${API_URL}/stand/${gameId}`, { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
        } catch (error) {
            handleError(error, "Stand");
        }
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

export default useGame;

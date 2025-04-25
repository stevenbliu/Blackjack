import { useState } from 'react';

interface Card {
    rank: string;
    suit: string;
    name: string;
    CardName: string;
}

interface GameState {
    game_id: string;
    player_hands: Card[][];  // Array of hands for multiple players
    dealer_hand: Card[];
    result?: string;
    player_hand?: Card[];  // Optional player hand (if needed for specific players or game states)

}

const API_URL = (() => {
    if (import.meta.env.DEV === true) {
        console.log("Development mode detected. Using development API URL.");
        return import.meta.env.VITE_DEVELOPMENT_API_URL;
    } else if (import.meta.env.DEV === false) {
        console.log("Production mode detected. Using production API URL.");
        return import.meta.env.VITE_PRODUCTION_API_URL;
    } else {
        throw new Error(`API URL not set. Please check your environment variables. DEV Enabled: ${import.meta.env.DEV}`);
    }
})();

const useGame = () => {
    const [gameId, setGameId] = useState<string | null>(null);
    const [playerHands, setPlayerHands] = useState<Card[][]>([]);  // Initialize as an empty array
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [currentPlayer, setCurrentPlayer] = useState<number>(0);  // Track whose turn it is

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
            console.log("Game started:", data, 'Player Hand Length:', data.player_hands.length);  // Log the response for debugging
            setGameId(data.game_id);
            setPlayerHands(data.player_hands || []);  // Ensure playerHands is not undefined
            setDealerHand(data.dealer_hand);
            setMessage(null);
            setGameOver(false);
            setCurrentPlayer(0);  // Start with the first player
        } catch (error) {
            handleError(error, "Start game");
        }
    };

    const hit = async (playerIndex: number) => {
        if (playerIndex !== currentPlayer) {
            setMessage("It's not your turn!");
            return;
        }

        if (!playerHands || playerHands.length <= playerIndex || !playerHands[playerIndex]) {
            setMessage("Invalid hand or player index.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/hit/${gameId}/${playerIndex}`, { method: 'POST' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: GameState = await res.json();
            console.log("Hit response data:", data.player_hand);  // Log the response for debugging

            // Update only the current player's hand
            setPlayerHands((prevHands) => {
                const updatedHands = [...prevHands];
                // updatedHands[playerIndex] = data.player_hand; // Update only the player's hand
                if (data.player_hand) {
                    updatedHands[playerIndex] = data.player_hand; // Update only the player's hand
                } else {
                    console.error("Player hand is undefined or null.");
                }
                return updatedHands;
            });

            console.log("Hit response:", data);  // Log the response for debugging
            if (data.result === "player_bust") {
                setMessage("You busted! Game over.");
                setGameOver(true);
            } else {
                setMessage(null);
                // Move to next player's turn
                setCurrentPlayer((prev) => (prev + 1) % playerHands.length);
            }
        } catch (error) {
            handleError(error, "Hit");
        }
    };

    const stand = async (playerIndex: number) => {
        if (playerIndex !== currentPlayer) {
            setMessage("It's not your turn!");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/stand/${gameId}/${playerIndex}`, { method: 'POST' });
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
        setPlayerHands([[], [], []]);  // Default hands for 3 players (modify if number of players changes)
        setDealerHand([]);
        setMessage(null);
        setGameOver(false);
        setCurrentPlayer(0);  // Reset turn to player 0
    };

    return {
        gameId,
        playerHands,  // Return the hands for all players
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

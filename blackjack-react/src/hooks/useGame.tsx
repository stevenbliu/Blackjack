import { useState } from 'react';

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
    player_hands: Card[][];  // Array of hands for multiple players
    dealer_hand: Card[];
    result: PlayerResult[] | string;  // Array of results for each player or a string indicating the game state
    player_hand: Card[];  // Optional player hand (if needed for specific players or game states)
    dealer_score?: number;  // Optional dealer score (if needed for specific game states)
    player_score?: number;  // Optional player score (if needed for specific game states)
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
            setMessage("Game started! Your turn.");
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
            // console.log("Hit response data:", data.player_hand);  // Log the response for debugging

            // Update only the current player's hand
            setPlayerHands((prevHands) => {
                const updatedHands = [...prevHands];
                if (data.player_hand) {
                    updatedHands[playerIndex] = data.player_hand; // Update only the player's hand
                } else {
                    console.error("Player hand is undefined or null.");
                }
                return updatedHands;
            });

            console.log("Hit response:", data);  // Log the response for debugging
            const latestCard: Card = data.player_hand.slice(-1)[0];  // Assuming the latest card is the first one in the array];
            const latestCardName = `${latestCard.rank}${latestCard.suit}` ;  // Assuming CardName is the property for the card name
            
            const result: string | PlayerResult[] = data.result;

            if (result === "player_bust") {
                setMessage(`You drew a ${latestCardName}. It's a bust! Game over.`);
                setGameOver(true);
            } else {
                setMessage(`You hit! ${latestCardName}`);  // Show the last card drawn
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
            console.log("Stand response data:", data);  // Log the response for debugging

            const result: string | PlayerResult[] = data.result;

            if (Array.isArray(result)) {
                // Now we know `result` is an array, we can safely access player_data
                const player_data: PlayerResult = result[0];  // Assuming result is an array of results for each player

                if (player_data.result === "win") {
                    setMessage(`Dealer busted! Dealer scored: ${data.dealer_score} You win.`);
                } else if (player_data.result === "loss") {
                    setMessage(`You lose! Dealer scored: ${data.dealer_score}`);
                } else if (player_data.result === "draw") {
                    setMessage(`Draw! Dealer scored: ${data.dealer_score}`);
                } else {
                    setMessage("Unknown!");
                }
            } else if (typeof result === "string") {
                // Handle case where result is a string
                setMessage(`Unexpected result format: ${result}`);
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

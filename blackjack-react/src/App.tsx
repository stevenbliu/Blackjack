import { useState } from 'react';

// Define the types for game and cards
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
}

function App() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);

  const startGame = async () => {
    const res = await fetch('http://localhost:8000/start', { method: 'POST' });
    const data: GameState = await res.json();
    setGameId(data.game_id);
    setPlayerHand(data.player_hand);
    setDealerHand(data.dealer_hand);
  };

  return (
    <div>
      <button onClick={startGame}>Start Game</button>
      {gameId && (
        <div>
          <h2>Game ID: {gameId}</h2>
          <div>
            <h3>Player Hand:</h3>
            {playerHand.map((card, i) => (
              <div key={i}>
                <span>{card.name}</span>
                <img src={`http://localhost:8000/card/${card.CardName}`} alt={card.name} width={70} />
              </div>
            ))}
          </div>
          <div>
            <h3>Dealer Hand:</h3>
            {dealerHand.map((card, i) => (
              <div key={i}>
                <span>{card.name}</span>
                <img src={`http://localhost:8000/card/${card.CardName}`} alt={card.name} width={70} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

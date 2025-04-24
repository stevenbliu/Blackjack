import React, { useState, useEffect } from 'react';
import Controls from '../Controls/Controls';
import MessageZone from '../MessageZone/MessageZone';
import Card from '../Card'; // Import the Card component
import './GameArea.css'; // Import the CSS file
// import Deck from '../Deck/Deck';


interface Card {
  CardName: string;
  name: string;
}

interface GameAreaProps {
  playerHand: Card[];
  dealerHand: Card[];
  gameId: string | null;
  startGame: () => void;
  hit: () => void;
  stand: () => void;
  restartGame: () => void;
  gameOver: boolean;
  message: string | null;
}

const GameArea: React.FC<GameAreaProps> = ({
  playerHand,
  dealerHand,
  gameId,
  startGame,
  hit,
  stand,
  restartGame,
  gameOver,
  message,
}) => {
  const [animatePlayerHand, setAnimatePlayerHand] = useState(false);
  const [animateDealerHand, setAnimateDealerHand] = useState(false);
  
  // Trigger the animations when the game starts
  useEffect(() => {
    if (gameId) {
      setAnimatePlayerHand(true);
      setAnimateDealerHand(true);
    }
  }, [gameId]);

  return (
    <div className="game-area">
      <div className="game-title">
        <h1>🎲 Blackjack</h1>

        {!gameId && (
          <button onClick={startGame} className="start-button">
            Start Game
          </button>
        )}

        {gameId && (
          <>
            <h3>
              Game ID: <span style={{ color: '#00e676' }}>{gameId}</span>
            </h3>

            <div className="hand-container">
              <h3 className="hand-header">Player Hand:</h3>
              <div className="card-container">
                {playerHand.map((card, i) => (
                  <Card
                    key={i}
                    cardName={card.CardName}
                    isFaceUp={true}
                    animate={animatePlayerHand}
                  />
                ))}
              </div>
            </div>

            <div className="hand-container">
              <h3 className="hand-header">Dealer Hand:</h3>
              <div className="card-container">
                {dealerHand.map((card, i) => (
                  <Card
                    key={i}
                    cardName={card.CardName}
                    isFaceUp={i !== 0} // Dealer's first card is face down
                    animate={animateDealerHand}
                  />
                ))}
              </div>
            </div>


            <div className="controls-container">
              <Controls onHit={hit} onStand={stand} onRestart={restartGame} disabled={gameOver} />
              {/* <Deck />  */}

            </div>


          </>
        )}
      </div>

      {/* Always show the message */}
      <MessageZone message={message} />
    </div>
  );
};

export default GameArea;

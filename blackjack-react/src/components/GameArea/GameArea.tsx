import React, { useState, useEffect } from 'react';
import Controls from '../Controls/Controls';
import MessageZone from '../MessageZone/MessageZone';
import Card from '../Card';
import styles from './GameArea.module.css';

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

  useEffect(() => {
    if (gameId) {
      setAnimatePlayerHand(true);
      setAnimateDealerHand(true);
    }
  }, [gameId]);

  return (
    <div className={styles.gameArea}>
      <div className={styles.gameTitle}>
        <h1>🎲 Blackjack</h1>

        {!gameId && (
          <button onClick={startGame} className={styles.startButton}>
            Start Game
          </button>
        )}

        {gameId && (
          <>
            <h3>
              Game ID: <span style={{ color: '#00e676' }}>{gameId}</span>
            </h3>

            <div className={styles.handZone}>
              <div className={styles.zoneTitle}>🧑 Player Hand</div>
              <div className={styles.cardContainer}>
                {playerHand.map((card, i) => (
                  <Card
                    key={i}
                    cardName={card.CardName}
                    isFaceUp={true}
                    animate={animatePlayerHand}
                    position={i}
                  />
                ))}
              </div>
            </div>

            <div className={styles.handZone}>
              <div className={styles.zoneTitle}>🎩 Dealer Hand</div>
              <div className={styles.cardContainer}>
                {dealerHand.map((card, i) => (
                  <Card
                    key={i}
                    cardName={card.CardName}
                    isFaceUp={i !== 1 || gameOver}
                    animate={animateDealerHand}
                    position={i}
                  />
                ))}
              </div>
            </div>

            <div className={styles.controlsContainer}>
              <Controls onHit={hit} onStand={stand} onRestart={restartGame} disabled={gameOver} />
            </div>
          </>
        )}
      </div>

      <MessageZone message={message} />
    </div>
  );
};

export default GameArea;

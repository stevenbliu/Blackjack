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
  playersHands: Card[][];
  dealerHand: Card[];
  gameId: string | null;
  startGame: () => void;
  hit: (playerIndex: number) => void;
  stand: (playerIndex: number) => void;
  restartGame: () => void;
  gameOver: boolean;
  message: string | null;
}

const GameArea: React.FC<GameAreaProps> = ({
  playersHands,
  dealerHand,
  gameId,
  startGame,
  hit,
  stand,
  restartGame,
  gameOver,
  message,
}) => {
  const [animateHands, setAnimateHands] = useState<boolean[]>([]);

  useEffect(() => {
    if (gameId) {
      setAnimateHands(Array(playersHands.length + 1).fill(true));
    }
  }, [gameId, playersHands.length]);

  return (
    <div className={styles.gameArea}>

      {/* Top Right - Game ID */}
      {
        <div className={styles.topRight}>
          <h3>
            Game ID: <span style={{ color: '#00e676' }}>{gameId}</span>
          </h3>
        </div>
      }

      {/* Bottom Right - Message Zone */}
      <div className={styles.topMiddle}>
        <MessageZone message={message} />
      </div>

      {/* Dealer Zone */}
      {gameId && (
        <>
          <div className={styles.dealerZone}>
            <div className={styles.zoneTitle}>🎩 Dealer Hand</div>
            <div className={styles.cardContainer}>
              {dealerHand.map((card, i) => (
                <Card
                  key={i}
                  cardName={card.CardName}
                  isFaceUp={i !== 1 || gameOver}
                  animate={animateHands[playersHands.length]}
                  position={i}
                />
              ))}
            </div>
          </div>

          {/* Player Zones */}
          <div className={styles.playerZones}>
            {playersHands.map((playerHand, playerIndex) => (
              <div key={playerIndex} className={styles.playerZone}>
                <div className={styles.zoneTitle}>🧑 Player {playerIndex + 1} Hand</div>
                <div className={styles.cardContainer}>
                  {playerHand.map((card, i) => (
                    <Card
                      key={i}
                      cardName={card.CardName}
                      isFaceUp={true}
                      animate={animateHands[playerIndex]}
                      position={i}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom Left - Controls (for player 0 or active player) */}
      {gameId && (
        <div className={styles.bottomLeft}>
          <Controls
            onHit={() => hit(0)}
            onStand={() => stand(0)}
            onRestart={restartGame}
            disabled={gameOver}
          />
        </div>
      )}


      {/* Game Title / Start Button */}
      <div className={styles.gameTitle}>
        {!gameId && (
          <button onClick={startGame} className={styles.startButton}>
            Start Game
          </button>
        )}
      </div>

    </div>
  );
};

export default GameArea;

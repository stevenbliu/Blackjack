// src/features/game/GameArea.tsx
import React, { useEffect, useState } from 'react';
import Controls from './components/Controls';
import MessageZone from './components/MessageZone';
import Card from './components/Card';
import styles from './GameArea.module.css';

interface CardData {
  CardName: string;
  name: string;
}

interface GameAreaProps {
  gameId: string | null;
  gameOver: boolean;
  message: string | null;

  startGame: () => void;
  hit: () => void;
  stand: () => void;
  restartGame: () => void;

  playersHands: CardData[][];
  dealerHand: CardData[];

  playerId: string;
  joinGame: (gameId: string, playerId: string) => void;
}

const GameArea: React.FC<GameAreaProps> = ({
  gameId,
  gameOver,
  message,
  startGame,
  hit,
  stand,
  restartGame,
  playersHands,
  dealerHand,
  playerId,
  joinGame,
}) => {
  const [animateHands, setAnimateHands] = useState<boolean[]>([]);

  useEffect(() => {
    if (gameId) {
      setAnimateHands(new Array(playersHands.length + 1).fill(true));
    }
  }, [gameId, playersHands.length]);

  const handleJoinGame = async () => {
    if (gameId) {
      try {
        await joinGame(gameId, playerId);
      } catch (err) {
        console.error("Failed to join game:", err);
      }
    }
  };

  return (
    <div className={styles.gameArea}>
      <div className={styles.topRight}>
        {gameId && <h3>Game ID: <span style={{ color: '#00e676' }}>{gameId}</span></h3>}
      </div>

      <div className={styles.topMiddle}>
        <MessageZone message={message} />
      </div>

      {gameId ? (
        <>
          {/* Dealer Hand */}
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

          {/* Player Hands */}
          <div className={styles.playerZones}>
            {playersHands.map((hand, index) => (
              <div key={index} className={styles.playerZone}>
                <div className={styles.zoneTitle}>🧑 Player {index + 1}</div>
                <div className={styles.cardContainer}>
                  {hand.map((card, i) => (
                    <Card
                      key={i}
                      cardName={card.CardName}
                      isFaceUp={true}
                      animate={animateHands[index]}
                      position={i}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className={styles.bottomLeft}>
            <Controls
              onHit={hit}
              onStand={stand}
              onRestart={restartGame}
              disabled={gameOver}
            />
          </div>
        </>
      ) : (
        // If no game started
        <div className={styles.gameTitle}>
          <button onClick={startGame} className={styles.startButton}>
            Start Game
          </button>
        </div>
      )}

      {/* Join Game Button */}
      {gameId && (
        <div className={styles.gameTitle}>
          <button onClick={handleJoinGame} className={styles.joinButton}>
            Join Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GameArea;

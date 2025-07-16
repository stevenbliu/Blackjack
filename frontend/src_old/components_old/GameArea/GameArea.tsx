// File: GameArea.tsx

import React, { useEffect, useState } from 'react';
import Controls from './GameControls';
import MessageZone from '../MessageZone/MessageZone';
import Card from '../Card';
import styles from './GameArea.module.css';
// import { useGame } from "./useGame";

interface CardProps {
  CardName: string;
  name: string;
}

interface GameAreaProps {
  // Game-related state
  gameId: string | null;
  gameOver: boolean;
  message: string | null;

  // Game actions
  startGame: () => void;
  hit: () => void;
  stand: () => void;
  restartGame: () => void;

  // Player and dealer hands
  playersHands: CardProps[][];
  dealerHand: CardProps[];

  // Player-specific data
  playerId: string;

  // Game action for joining
  joinGame: (gameId: string, playerId: string) => void;
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
  playerId,
  joinGame,
}) => {
  const [animateHands, setAnimateHands] = useState<boolean[]>([]);

  useEffect(() => {
    if (gameId) {
      setAnimateHands(new Array(playersHands.length + 1).fill(true));
    }
  }, [gameId, playersHands.length]);

  // Join Game handler that calls backend to add the player
  const handleJoinGame = async () => {
    if (gameId) {
      try {
        await joinGame(gameId, playerId); // Call backend to join the game
      } catch (error) {
        console.error("Error joining the game:", error);
      }
    }
  };

  return (
    <div className={styles.gameArea}>
      <div className={styles.topRight}>
        {gameId && (
          <h3>Game ID: <span style={{ color: '#00e676' }}>{gameId}</span></h3>
        )}
      </div>

      <div className={styles.topMiddle}>
        <MessageZone message={message} />
      </div>

      {gameId && (
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
      )}

      {/* Start Game Button */}
      {!gameId && (
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

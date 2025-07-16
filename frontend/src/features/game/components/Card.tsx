// src/features/game/components/Card.tsx
import React, { useEffect, useRef } from 'react';
import styles from './Card.module.css';
import { gsap } from 'gsap';

interface CardProps {
  cardName: string;         // e.g. "AS" for Ace of Spades, or "10H" for Ten of Hearts
  isFaceUp: boolean;
  animate?: boolean;
  position?: number;        // Optional: for staggered animation or styling
}

const Card: React.FC<CardProps> = ({ cardName, isFaceUp, animate = false, position = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animate && cardRef.current) {
      // Simple flip animation using GSAP
      gsap.fromTo(
        cardRef.current,
        { rotationY: 180 },
        { rotationY: 0, duration: 0.6, ease: 'power2.out', delay: position * 0.1 }
      );
    }
  }, [animate, position]);

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isFaceUp ? styles.faceUp : styles.faceDown}`}
      aria-label={isFaceUp ? `Card ${cardName}` : 'Face down card'}
      role="img"
    >
      {isFaceUp ? (
        <img
          src={`/cards/${cardName}.svg`}
          alt={cardName}
          className={styles.cardImage}
          draggable={false}
        />
      ) : (
        <div className={styles.cardBack} />
      )}
    </div>
  );
};

export default Card;

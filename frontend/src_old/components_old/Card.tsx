import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Card.module.css'; // Use CSS module instead of global CSS

interface CardProps {
  cardName: string;
  isFaceUp: boolean;
  animate: boolean;
  position: number;
}

const Card: React.FC<CardProps> = ({ cardName, isFaceUp, animate, position }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animate && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "bounce.out" }
      );
    }
  }, [animate]);

  const translateX = position * 1.25;
  const translateY = position * 2.31;

  return (
    <div
      ref={cardRef}
      className={styles.cardContainer}
      style={{
        transform: `translateX(${translateX}vw) translateY(${translateY}vh)`,
        zIndex: position,
      }}
    >
      <img
        className={styles.cardImage}
        src={isFaceUp ? `/cards/${cardName}.svg` : `/cards/back_of_card.svg`}
        alt={cardName}
      />
    </div>
  );
};

export default Card;

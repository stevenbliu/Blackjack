import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Card.css'; // Import the CSS for card animations

interface CardProps {
  cardName: string;
  cardAlt: string;
  isFaceUp: boolean;
  animate: boolean;
}

const Card: React.FC<CardProps> = ({ cardName, cardAlt, isFaceUp, animate }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Flip the card animation (on deal or when clicked for example)
  useEffect(() => {
    if (animate && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "bounce.out" }
      );
    }
  }, [animate]);

  return (
    <div ref={cardRef} className={`card-container`}>
      <img
        className={`card-image`}
        src={isFaceUp ? `http://localhost:8000/card/${cardName}` : `http://localhost:8000/card/back_of_card`}
        alt={cardAlt}
      />
      {/* <p>{cardAlt}</p> */}
    </div>
  );
};

export default Card;

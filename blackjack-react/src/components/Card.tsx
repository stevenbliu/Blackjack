// src/components/Card.tsx
import React, { useRef, useEffect } from 'react';
import './Card.css'; // use your current CSS
import { gsap } from 'gsap';

type CardProps = {
  cardName: string;
  flipped?: boolean;
  isDealerHoleCard?: boolean;
};

const Card: React.FC<CardProps> = ({ cardName, flipped = false, isDealerHoleCard = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (flipped && cardRef.current) {
      gsap.set(cardRef.current, { rotationY: 180 });
    }
  }, [flipped]);

  return (
    <div
      className={`card ${flipped ? 'flipped' : ''} ${isDealerHoleCard ? 'dealer-hole-card' : ''}`}
      ref={cardRef}
    >
      <div className="card-inner">
        <div className="card-front">
          <img src={`/assets/cards/${cardName}.svg`} alt={cardName} />
        </div>
        <div className="card-back">
          <img src="/assets/cards/back_of_card.svg" alt="Back of card" />
        </div>
      </div>
    </div>
  );
};

export default Card;

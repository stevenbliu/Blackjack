import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Card.css'; // Import the CSS for card animations

interface CardProps {
  cardName: string;
  isFaceUp: boolean;
  animate: boolean;
}

// const API_URL = (() => {
//   if (import.meta.env.DEV === true) {  // Checking against string "true"
//     console.log("Development mode detected. Using development API URL.");
//     return import.meta.env.VITE_DEVELOPMENT_API_URL;
//   } else if (import.meta.env.DEV === false) {  // Checking against string "false"
//     console.log("Production mode detected. Using production API URL.");
//     return import.meta.env.VITE_PRODUCTION_API_URL;
//   } else {
//     throw new Error(`API URL not set. Please check your environment variables. DEV Enabled: ${import.meta.env.DEV}`);
//   }
// })();

const Card: React.FC<CardProps> = ({ cardName, isFaceUp, animate }) => {
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
        // src={isFaceUp ? `${API_URL}/static/cards/${cardName}.svg` : `${API_URL}/static/cards/back_of_card.svg`}
        src={isFaceUp ? `/cards/${cardName}.svg` : `/cards/back_of_card.svg`}
      // alt={cardAlt}
      />
      {/* <p>{cardAlt}</p> */}
    </div>
  );
};

export default Card;

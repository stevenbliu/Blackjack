import { jsx as _jsx } from "react/jsx-runtime";
// src/features/game/components/Card.tsx
import { useEffect, useRef } from 'react';
import styles from './Card.module.css';
import { gsap } from 'gsap';
const Card = ({ cardName, isFaceUp, animate = false, position = 0 }) => {
    const cardRef = useRef(null);
    useEffect(() => {
        if (animate && cardRef.current) {
            // Simple flip animation using GSAP
            gsap.fromTo(cardRef.current, { rotationY: 180 }, { rotationY: 0, duration: 0.6, ease: 'power2.out', delay: position * 0.1 });
        }
    }, [animate, position]);
    return (_jsx("div", { ref: cardRef, className: `${styles.card} ${isFaceUp ? styles.faceUp : styles.faceDown}`, "aria-label": isFaceUp ? `Card ${cardName}` : 'Face down card', role: "img", children: isFaceUp ? (_jsx("img", { src: `/cards/${cardName}.svg`, alt: cardName, className: styles.cardImage, draggable: false })) : (_jsx("div", { className: styles.cardBack })) }));
};
export default Card;

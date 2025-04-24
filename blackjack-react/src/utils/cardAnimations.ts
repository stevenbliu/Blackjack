// src/utils/cardAnimations.ts
import { gsap } from 'gsap';

// Flip a single card
export const flipCard = (cardElement: HTMLElement) => {
  gsap.to(cardElement, {
    duration: 1,
    rotationY: 180,
    transformOrigin: "center",
    ease: "power2.inOut",
    onComplete: () => {
      cardElement.style.transform = 'rotateY(0deg)'; // Reset to normal after flip
    }
  });
};

// Reveal multiple cards sequentially
export const revealCards = (cards: HTMLElement[]) => {
  const tl = gsap.timeline();
  cards.forEach((cardElement, index) => {
    tl.to(cardElement, {
      duration: 1,
      rotationY: 180,
      delay: index * 0.2, // Add delay to each card for staggered reveal
      transformOrigin: "center",
      ease: "power2.inOut",
    });
  });
};

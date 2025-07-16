import { gsap } from 'gsap';

export const flipCard = (cardElement: HTMLElement) => {
  gsap.to(cardElement, {
    duration: 1,
    rotationY: 180,
    transformOrigin: 'center',
    ease: 'power2.inOut',
    onComplete: () => {
      cardElement.style.transform = 'rotateY(0deg)';
    },
  });
};

export const revealCards = (cards: HTMLElement[]) => {
  const tl = gsap.timeline();
  cards.forEach((cardElement, index) => {
    tl.to(cardElement, {
      duration: 1,
      rotationY: 180,
      delay: index * 0.2,
      transformOrigin: 'center',
      ease: 'power2.inOut',
    });
  });
};

// src/animations/animations.ts
import { gsap } from 'gsap';

export function drawAnimation(
  cardEl: HTMLDivElement,
  container: HTMLDivElement,
  index: number
) {
  const deck = document.getElementById('deck2');
  if (!deck) return;

  const deckRect = deck.getBoundingClientRect();
  const cardRect = container.getBoundingClientRect();
  const dx = deckRect.left - cardRect.left;
  const dy = deckRect.top - cardRect.top;

  cardEl.style.transform = `translate(${dx}px, ${dy}px)`;
  cardEl.style.opacity = '1';

  gsap.to(cardEl, {
    duration: 0.5,
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    ease: 'power2.out',
    delay: index * 0.1,
  });
}

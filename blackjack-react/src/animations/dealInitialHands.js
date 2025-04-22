import { drawAnimation } from './animations.js';
import { createCard } from './cards.js';

export async function dealInitialHands(deckOrder, playerContainer, dealerContainer) {
  const promises = [];

  // First 4 cards — alternating player and dealer
  for (let i = 0; i < 4; i++) {
    const isPlayer = i % 2 === 0;
    const cardData = deckOrder[i];
    const flipped = !isPlayer && i === 3; // Dealer's second card is hidden
    const cardElement = createCard(cardData, flipped);

    if (!isPlayer && i === 3) cardElement.classList.add('dealer-hole-card');

    const container = isPlayer ? playerContainer : dealerContainer;

    // Animate with slight delay
    promises.push(
      new Promise(resolve => {
        setTimeout(() => {
          drawAnimation(cardElement, container, 0);
          resolve();
        }, i * 500); // Delay between cards
      })
    );
  }

  return Promise.all(promises); // Wait for all animations
}

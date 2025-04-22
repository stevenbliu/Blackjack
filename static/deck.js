import { createCard } from './cards.js'; // Ensure this exports your createCard function

const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

/**
 * Generate the full visual deck of 52 face-down cards
 */
export function generateVisualDeck() {
  const deckContainer = document.getElementById('deck-container');
  deckContainer.innerHTML = '';

  const cards = [];

  suits.forEach(suit => {
    ranks.forEach(rank => {
      const cardName = `${rank}_of_${suit}`;
      const cardData = { CardName: cardName };
      const card = createCard(cardData, true); // always flipped at the start

      // Stack them neatly
      card.style.position = 'absolute';
      card.style.top = '0';
      card.style.left = '0';

      deckContainer.appendChild(card);
      cards.push(card);
    });
  });

  return cards;
}

/**
 * Animate the shuffle of visual cards
 */
export function animateShuffle(cards) {
  const tl = gsap.timeline();


    //   Get the deck's position
    const deck = document.getElementById('deck2');
  const deckRect = deck.getBoundingClientRect();
//   cards.forEach((card, index) => {
//     //     const cardRect = card.getBoundingClientRect();
//     //     const dx = deckRect.left - cardRect.left;
//     //     const dy = deckRect.top - cardRect.top;

//   Scatter cards around
  tl.to(cards, {
    x: () => gsap.utils.random(-100, 100),
    y: () => gsap.utils.random(-150, 150),
    rotation: () => gsap.utils.random(-30, 30),
    stagger: 0.02,
    duration: 0.5,
    ease: 'power2.inOut',
  });

//   Restack the deck face-down
  tl.to(cards, {
    x: deckRect.left - deckRect.width / 2,
    y: deckRect.top - deckRect.height / 2,
    // y: 0,
    rotation: 0,
    stagger: 0.02,
    duration: 0.5,
    ease: 'power1.in',
    onStart: () => {
      cards.forEach(card => card.classList.add('flipped'));
    },
  });
}

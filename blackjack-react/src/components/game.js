import { createCard, revealDealerHole } from './cards.js';
import { dealInitialHands } from './dealInitialHands.js';

console.log("game.js loaded");

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startButton').addEventListener('click', startGame);
  document.getElementById('hitButton').addEventListener('click', hit);
  document.getElementById('standButton').addEventListener('click', stand);
  // document.getElementById('shuffleButton').addEventListener('click', shuffle);
});

let gameId = null;

// -----------------------------
// Start Game
// -----------------------------
function startGame() {
  fetch('/start', { method: 'POST' })
    .then(res => res.json())
    .then(async data => {
      gameId = data.game_id;
      const playerContainer = document.getElementById('player');
      const dealerContainer = document.getElementById('dealer');

      // Clear containers
      playerContainer.innerHTML = '';
      dealerContainer.innerHTML = '';

      // Animate the deal
      await dealInitialHands(data.deck_order.slice(0, 4), playerContainer, dealerContainer);

      document.getElementById('message').textContent = "";
      toggleButtons(true);

      document.getElementById('hitButton').disabled = false;
      document.getElementById('standButton').disabled = false;

      console.log("Game started");
    });
}

// -----------------------------
// Hit
// -----------------------------
function hit() {
  fetch(`/hit/${gameId}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (data.error) return alert(data.error);
      displayCards(data.player_hand, 'player');

      if (data.result === "bust") {
        document.getElementById('message').textContent = "You busted! 💥";
        toggleButtons(false);
        revealDealerHole();  // Flip the hole card if player busts
      }
    });
}

// -----------------------------
// Stand
// -----------------------------
function stand() {
  fetch(`/stand/${gameId}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      displayCards(data.dealer_hand, 'dealer');
      revealDealerHole();  // Flip the hole card when standing

      let msg = {
        "player_wins": "You win! 🏆",
        "dealer_wins": "Dealer wins 😞",
        "draw": "It's a draw 🤝"
      }[data.result];

      document.getElementById('message').textContent = msg;
      toggleButtons(false);
    });
}

// -----------------------------
// Toggle Hit & Stand Buttons
// -----------------------------
function toggleButtons(enable) {
  document.querySelectorAll('button')[1].disabled = !enable;  // Hit
  document.querySelectorAll('button')[2].disabled = !enable;  // Stand
}

// -----------------------------
// Display Cards
// -----------------------------
function displayCards(hand, player) {
  const handContainer = document.getElementById(player);
  handContainer.innerHTML = '';

  hand.forEach((card, index) => {
    const showBack = (player === 'dealer' && index === 1);
    const cardElement = createCard(card, showBack);

    if (showBack) {
      cardElement.classList.add('dealer-hole-card');
    }

    handContainer.appendChild(cardElement);
  });
}

// -----------------------------
// Reveal Dealer's Facedown Card
// -----------------------------
// function revealDealerHole() {
//   const holeCard = document.querySelector('.dealer-hole-card');
//   if (holeCard) {
//     holeCard.classList.remove('flipped');
//   }
// }

// -----------------------------
// Shuffle Animation
// -----------------------------
// function shuffle() {
//   const cards = document.querySelectorAll('img');
//   const deck = document.getElementById('deck2');
//   const deckRect = deck.getBoundingClientRect();

//   cards.forEach((card, index) => {
//     const cardRect = card.getBoundingClientRect();
//     const dx = deckRect.left - cardRect.left;
//     const dy = deckRect.top - cardRect.top;

//     gsap.to(card, {
//       x: dx,
//       y: dy,
//       rotation: 1080,
//       duration: 0.8,
//       ease: "power2.out",
//       delay: index * 0.1
//     });
//   });

//   setTimeout(() => {
//     gsap.to(cards, {
//       x: 0,
//       y: 0,
//       rotation: 0,
//       scale: 1,
//       duration: 0.5,
//       ease: "power1.out"
//     });
//   }, 800);
// }


import { generateVisualDeck, animateShuffle } from './deck.js';

document.addEventListener('DOMContentLoaded', () => {
  const cards = generateVisualDeck();

  document.getElementById('shuffleButton').addEventListener('click', () => {
    animateShuffle(cards);
  });
});

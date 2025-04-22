export function createCard(card, flipped = false) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    if (flipped) cardElement.classList.add('flipped');
  
    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');
  
    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    const cardImage = document.createElement('img');
    cardImage.src = `/static/cards/${card.CardName}.svg`;
    cardImage.alt = card.CardName;
    cardFront.appendChild(cardImage);
  
    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    const backImage = document.createElement('img');
    backImage.src = '/static/cards/back_of_card.svg';
    cardBack.appendChild(backImage);
  
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    cardElement.appendChild(cardInner);
    
    return cardElement;
  }

// Function to flip the dealer's facedown card using GSAP Flip
export function revealDealerHole() {
const card = document.querySelector('.dealer-hole-card');
if (!card) return;

// 1. Capture the card's current state
const state = Flip.getState(card);

// 2. Toggle the 'flipped' class (this should visually flip it via CSS)
card.classList.remove('flipped');

// 3. Animate to the new state
Flip.from(state, {
    duration: 0.6,
    ease: "power1.inOut"
});
}

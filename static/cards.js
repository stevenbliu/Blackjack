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
  
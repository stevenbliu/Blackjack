// src/components/CardDeck/CardDeck.tsx
import React, { useState, useEffect } from 'react';
import Card from '../Card/Card';

interface Card {
  CardName: string;
  name: string;
}

interface CardDeckProps {
  playerHand: Card[];
  dealerHand: Card[];
  onDealCards: boolean;   // Trigger the card deal animation
  onFlipCards: boolean;   // Trigger the flip animation
}

const CardDeck: React.FC<CardDeckProps> = ({ playerHand, dealerHand, onDealCards, onFlipCards }) => {
  // Combine player and dealer hands
  const allCards = [...playerHand, ...dealerHand];

  return (
    <div className="card-deck">
      {allCards.map((card, index) => (
        <Card
          key={index}
          cardFront={`http://localhost:8000/card/${card.CardName}`}
          cardBack={`http://localhost:8000/card/back_of_card`}
          onDeal={onDealCards}
          onFlip={onFlipCards}
          delay={index * 0.1}  // Stagger animation for multiple cards
          index={index}
        />
      ))}
    </div>
  );
};

export default CardDeck;

// src/components/GameBoard.tsx
import React from 'react';
import Card from './Card';

type CardData = {
  CardName: string;
};

type GameBoardProps = {
  playerHand: CardData[];
  dealerHand: CardData[];
};

const GameBoard: React.FC<GameBoardProps> = ({ playerHand, dealerHand }) => {
  return (
    <div>
      <div id="dealer" className="hand">
        {dealerHand.map((card, idx) => (
          <Card
            key={idx}
            cardName={card.CardName}
            flipped={idx === 1}
            isDealerHoleCard={idx === 1}
          />
        ))}
      </div>

      <div id="player" className="hand">
        {playerHand.map((card, idx) => (
          <Card key={idx} cardName={card.CardName} />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;

import { CardData } from "../../tabletopSlice";

interface CardProps {
  card: CardData;
  faceUp?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const Card: React.FC<CardProps> = ({
  card,
  faceUp = false,
  draggable = false,
  onDragStart,
}) => {
  const cardImage = faceUp
    ? `/cards/${card.value}_of_${card.suit}.svg`
    : `/cards/red_joker.svg`; // back of card image

  return (
    <img
      src={cardImage}
      alt={`${card.value} of ${card.suit}?@!?#?!`}
      // className={styles.card}
      draggable={draggable}
      onDragStart={onDragStart}
      height='100px'
    />
  );
};

export default Card;

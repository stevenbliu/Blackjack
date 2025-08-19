import { CardData, sendCardDragStart } from "../../tabletopSlice";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";

interface CardProps {
  card: CardData;
  faceUp?: boolean;
  draggableId?: string; // Changed from Int16Array
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const Card: React.FC<CardProps> = ({
  card,
  faceUp = false,
  draggableId,
  onDragStart,
  onDragEnd,
}) => {
  const dispatch = useAppDispatch()
  const playerId = useAppSelector((state) => state.player.playerId)


  const cardImage = faceUp
    ? `/cards/${card.value}_of_${card.suit}.svg`
    : `/cards/red_joker.svg`;

  const handleDragStart = (e: React.DragEvent) => {
    if (draggableId) {
      e.dataTransfer.setData("cardId", draggableId);
      dispatch(sendCardDragStart(card.id, playerId!));
    }
    if (onDragStart) onDragStart(e);
  };

  return (
    <img
      src={cardImage}
      alt={`${card.value} of ${card.suit}`}
      draggable={!!draggableId}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      height="100px"
    />
  );
};

export default Card;

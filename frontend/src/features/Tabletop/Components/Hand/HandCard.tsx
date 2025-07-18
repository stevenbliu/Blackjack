import { useDrag } from 'react-dnd';
import { ItemTypes } from '../../constants/dndTypes';
import type { CardData } from '../../tabletopSlice';
import Card from '../Card/Card'; // adjust path as needed

interface HandCardProps {
  card: CardData;
}

export const HandCard = ({ card }: HandCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: card.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      <Card card={card} faceUp draggable />
    </div>
  );
};

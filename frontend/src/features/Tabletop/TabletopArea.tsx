import { useDrop } from 'react-dnd';
import { ItemTypes } from './constants/dndTypes';
import { useDispatch } from 'react-redux';
import { moveToTable } from './tabletopSlice';

export const TableArea = () => {
  const dispatch = useDispatch();

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: { id: string }) => {
      dispatch(moveToTable(item.id));
    },
  }));

  return (
    <div
      ref={drop}
      style={{
        minHeight: '200px',
        border: '2px dashed green',
        padding: '1rem',
        marginTop: '2rem',
      }}
    >
      Drop cards here
    </div>
  );
};

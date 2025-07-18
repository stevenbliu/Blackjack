import { useDrop } from 'react-dnd';
import { ItemTypes } from './constants/dndTypes';
import { useDispatch } from 'react-redux';
import { moveToTable } from './tabletopSlice';
import React from 'react';

export const TableArea = () => {
  const dispatch = useDispatch();

  const dropRef = React.useRef<HTMLDivElement>(null);

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: { id: string }) => {
      dispatch(moveToTable(item.id));
    },
  }));

  React.useEffect(() => {
    if (dropRef.current) {
      drop(dropRef.current);
    }
  }, [drop]);

  return (
    <div
      ref={dropRef}
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

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { HandCard } from './Components/Hand/HandCard';
import { TableArea } from './TabletopArea';
import { reset, drawCard } from './tabletopSlice';

export const Tabletop = () => {
  const dispatch = useDispatch();
  const { hand, table } = useSelector((state: RootState) => state.tabletop);

  useEffect(() => {
    dispatch(reset()); // spawn the deck on component mount
  }, [dispatch]);

  return (
    <div>
      <h2>Hand</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {hand.map((card) => (
          <HandCard key={card.id} card={card} />
        ))}
      </div>

    <button onClick={() => dispatch(drawCard())}>Draw Card</button>

      <TableArea />

      <h2>Table</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {table.map((card) => (
          <div key={card.id} style={{ border: '1px solid gray', padding: '0.5rem' }}>
            {card.imageUrl}
          </div>
        ))}
      </div>
    </div>
  );
};

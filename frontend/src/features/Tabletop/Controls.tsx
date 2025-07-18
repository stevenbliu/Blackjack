import React from 'react';

interface ControlsProps {
  onDraw: () => void;
  onShuffle: () => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onDraw, onShuffle, onReset }) => {
  return (
    <div>
      <button onClick={onDraw}>🎴 Draw</button>
      <button onClick={onShuffle}>🔀 Shuffle</button>
      <button onClick={onReset}>♻️ Reset</button>
    </div>
  );
};

export default Controls;

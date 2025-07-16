// File: GameControls.tsx (renamed to match functionality)

import React from 'react';
import useGame from './useGame';

const buttonStyle = (disabled: boolean, color: string) => ({
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: disabled ? '#ccc' : color,
  color: disabled ? '#666' : 'white',
  border: 'none',
  borderRadius: '5px',
  margin: '5px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  transition: 'all 0.3s ease',
});

const GameControls: React.FC = () => {
  const {
    gameOver,
    hit,
    stand,
    restartGame,
  } = useGame();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '20px',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '8px',
      background: 'gray',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <button
        onClick={hit}
        disabled={gameOver}
        style={buttonStyle(gameOver, 'green')}
      >
        Hit
      </button>

      <button
        onClick={stand}
        disabled={gameOver}
        style={buttonStyle(gameOver, 'red')}
      >
        Stand
      </button>

      <button
        onClick={restartGame}
        style={buttonStyle(false, '#007bff')}
      >
        Restart
      </button>
    </div>
  );
};

export default GameControls;

import React from 'react';

interface ControlsProps {
  onHit: () => void;
  onStand: () => void;
  onRestart: () => void;
  disabled: boolean;
}

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

const Controls: React.FC<ControlsProps> = ({ onHit, onStand, onRestart, disabled }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', background: 'gray', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
      <button
        onClick={onHit}
        disabled={disabled}
        style={buttonStyle(disabled, 'green')}
      >
        Hit
      </button>

      <button
        onClick={onStand}
        disabled={disabled}
        style={buttonStyle(disabled, 'red')}
      >
        Stand
      </button>

      <button
        onClick={onRestart}
        style={buttonStyle(false, '#007bff')}
      >
        Restart
      </button>
    </div>
  );
};

export default Controls;

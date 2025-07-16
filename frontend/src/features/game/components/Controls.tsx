// src/features/game/components/Controls.tsx
import React from 'react';
import styles from './Controls.module.css';

interface ControlsProps {
  onHit: () => void;
  onStand: () => void;
  onRestart: () => void;
  disabled?: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onHit, onStand, onRestart, disabled = false }) => {
  return (
    <div className={styles.controls}>
      <button onClick={onHit} disabled={disabled} className={styles.controlButton}>
        Hit
      </button>
      <button onClick={onStand} disabled={disabled} className={styles.controlButton}>
        Stand
      </button>
      <button onClick={onRestart} className={styles.controlButton}>
        Restart
      </button>
    </div>
  );
};

export default Controls;

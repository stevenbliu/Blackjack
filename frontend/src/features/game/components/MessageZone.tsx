// src/features/game/components/MessageZone.tsx
import React from 'react';
import styles from './MessageZone.module.css';

interface MessageZoneProps {
  message: string | null;
}

const MessageZone: React.FC<MessageZoneProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className={styles.messageZone} role="alert" aria-live="polite">
      {message}
    </div>
  );
};

export default MessageZone;

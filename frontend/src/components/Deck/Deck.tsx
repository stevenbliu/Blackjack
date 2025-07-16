import React from 'react';
import styles from './Deck.module.css';

const Deck: React.FC = () => {
  return (
    <div className={styles.deck}>
      {/* You can customize this as needed */}
      <div className={styles.cardBack}></div>
      <div className={styles.cardBack}></div>
      <div className={styles.cardBack}></div>
    </div>
  );
};

export default Deck;

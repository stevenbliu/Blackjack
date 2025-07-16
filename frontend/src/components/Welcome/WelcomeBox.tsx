import React from 'react';
import Deck from '../Deck/Deck';
import styles from './WelcomeBox.module.css'; // Importing CSS modules for scoping

const WelcomeBox: React.FC = () => (
  <div className={styles.welcomeBox}>
    <h1> Blackjack</h1>
    <h1> 🃏 </h1>
    <p>
      Try to beat the dealer by getting as close to 21 as possible without going over.
    </p>

    
    <Deck />
  </div>
);

export default WelcomeBox;

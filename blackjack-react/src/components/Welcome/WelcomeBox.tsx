// src/components/WelcomeBox.tsx
import React from 'react';
import Deck from '../Deck/Deck'; // Adjust the import path as necessary

const WelcomeBox = () => {
  return (
    <div
      style={{
        width: '300px',
        background: 'black',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        overflow: 'visible',
      }}
    >
      <h1 style={{ color: '#00e676' }}>Welcome to Blackjack</h1>
      <p style={{ color: '#00e676' }}>
        Try to beat the dealer by getting as close to 21 as possible without going over.
      </p>

      <Deck />

    </div>
  );
};

export default WelcomeBox;

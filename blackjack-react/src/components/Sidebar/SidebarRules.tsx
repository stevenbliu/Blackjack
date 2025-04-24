// src/components/SidebarRules.tsx
import React from 'react';

interface SidebarRulesProps {
  rulesVisible: boolean;
  setRulesVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarRules: React.FC<SidebarRulesProps> = ({ rulesVisible, setRulesVisible }) => {
  return (
    <div
      style={{
        width: '250px',
        // background: 'red',
        padding: '20px',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'hidden',
      }}
    >
      <button
        onClick={() => setRulesVisible(!rulesVisible)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginBottom: '10px',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {rulesVisible ? 'Hide Rules' : 'Show Rules'}
      </button>
      {rulesVisible && (
        <div
          style={{
            marginTop: '20px',
            marginBottom: '20px',
            backgroundColor: '#2e7d32', // a softer green
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            maxWidth: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}
        >
          <h3 style={{ marginBottom: '16px' }}>Rules:</h3>
          <ul
            style={{
              padding: 0,
              margin: 0,
              listStyleType: 'disc',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingLeft: '20px'
            }}
          >
            <li>The dealer will draw (hit) cards until they reach 17 or higher.</li>
            <li>You can hit to draw more cards or stand to end your turn.</li>
            <li>If you go over 21, you bust and lose the game.</li>
            <li>If the dealer busts, you win!</li>
            <li>If you and the dealer have the same score, it's a tie.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SidebarRules;

// src/App.tsx
import React, { useState } from 'react';
import useGame from './hooks/useGame';  // adjust the relative path as needed
import GameArea from './components/GameArea/GameArea';
import SidebarRules from './components/Sidebar/SidebarRules';
// import MessageZone from './components/MessageZone/MessageZone';
import './App.css';
import WelcomeBox from './components/Welcome/WelcomeBox';

const App: React.FC = () => {
  const {
    gameId,
    playerHand,
    dealerHand,
    message,
    gameOver,
    startGame,
    hit,
    stand,
    restartGame
  } = useGame();

  const [rulesVisible, setRulesVisible] = useState<boolean>(false);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      flexDirection: 'row',
      backgroundColor: '#121212',
      color: '#f0f0f0',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden',
      padding: 0
    }}>
      <WelcomeBox />


      <GameArea
        playerHand={playerHand}
        dealerHand={dealerHand}
        gameId={gameId}
        startGame={startGame}
        hit={hit}
        stand={stand}
        restartGame={restartGame}
        gameOver={gameOver}
        message={message}
      />
      <SidebarRules rulesVisible={rulesVisible} setRulesVisible={setRulesVisible} />

      {/* <MessageZone message={message} /> */}
    </div>
  );
};

export default App;

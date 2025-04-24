// src/App.tsx
import React, { useState } from 'react';
import useGame from './hooks/useGame';  // adjust the relative path as needed
import GameArea from './components/GameArea/GameArea';
import SidebarRules from './components/Sidebar/SidebarRules';
// import MessageZone from './components/MessageZone/MessageZone';
// import './App.css';
import WelcomeBox from './components/Welcome/WelcomeBox';
import styles from './App.module.css';

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
    <div className={styles.app}>

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

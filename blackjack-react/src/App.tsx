import React, { useState } from 'react';
import useGame from './hooks/useGame';  // Adjust the relative path as needed
import GameArea from './components/GameArea/GameArea';
import SidebarRules from './components/Sidebar/SidebarRules';
import WelcomeBox from './components/Welcome/WelcomeBox';
import styles from './App.module.css';

const App: React.FC = () => {
  // Fetching the game state for multiple players
  const {
    gameId,
    playerHands, // Assuming this is now a 2D array (one array for each player)
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
        playersHands={playerHands} // Pass the players' hands (2D array)
        dealerHand={dealerHand} // Pass the dealer's hand
        gameId={gameId}
        startGame={startGame}
        hit={hit} // Pass the hit function
        stand={stand} // Pass the stand function
        restartGame={restartGame}
        gameOver={gameOver}
        message={message}
      />

      <SidebarRules rulesVisible={rulesVisible} setRulesVisible={setRulesVisible} />
    </div>
  );
};

export default App;

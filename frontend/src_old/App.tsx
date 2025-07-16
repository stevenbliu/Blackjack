import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './redux/store'; // corrected store path
import GameArea from './components/GameArea/GameArea';
import SidebarRules from './components/Sidebar/SidebarRules';
import WelcomeBox from './components/Welcome/WelcomeBox';
import Lobby from './components/Lobby/Lobby';
import styles from './App.module.css';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const [rulesVisible, setRulesVisible] = useState(false);

  // Select necessary state from Redux
  const gameId = useSelector((state: RootState) => state.game.gameId);
  // Placeholder: Replace with real logic once player auth is implemented
  const playerId = '12345';

  return (
    <div className={styles.app}>
      <WelcomeBox />

      {!gameId ? (
        <Lobby currentPlayerId={playerId} />
      ) : (
        <GameArea playerId={playerId} gameId={gameId} />
      )}

      <SidebarRules rulesVisible={rulesVisible} setRulesVisible={setRulesVisible} />
    </div>
  );
};

export default App;

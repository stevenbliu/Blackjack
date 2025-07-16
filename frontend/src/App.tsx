import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks'; // or wherever your typed hooks are
import GameArea from './features/game/GameArea';
import SidebarRules from './components/Sidebar/SidebarRules';
import WelcomeBox from './components/Welcome/WelcomeBox';
import Lobby from './features/lobby/Lobby';
import {
  startGame,
  hit,
  stand,
  restartGame,
  joinGame,
} from './features/game/gameSlice';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [rulesVisible, setRulesVisible] = useState(false);

  const gameId = useAppSelector(state => state.game.gameId);
  const playerId = '12345';
  const gameOver = useAppSelector(state => state.game.gameOver);
  const message = useAppSelector(state => state.game.message);
  const playersHands = useAppSelector(state => state.game.playersHands);
  const dealerHand = useAppSelector(state => state.game.dealerHand);

  const handleStartGame = () => dispatch(startGame());
  const handleHit = () => dispatch(hit());
  const handleStand = () => dispatch(stand());
  const handleRestartGame = () => dispatch(restartGame());
  const handleJoinGame = (gameId: string, playerId: string) => dispatch(joinGame({ gameId, playerId }));

  return (
    <div>
      <WelcomeBox />
      {!gameId ? (
        <Lobby currentPlayerId={playerId} />
      ) : (
        <GameArea
          playerId={playerId}
          gameId={gameId}
          gameOver={gameOver}
          message={message}
          playersHands={playersHands}
          dealerHand={dealerHand}
          startGame={handleStartGame}
          hit={handleHit}
          stand={handleStand}
          restartGame={handleRestartGame}
          joinGame={handleJoinGame}
        />
      )}
      <SidebarRules rulesVisible={rulesVisible} setRulesVisible={setRulesVisible} />
    </div>
  );
};

export default App;

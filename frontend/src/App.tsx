import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
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
import ChatRoom from './features/chat/ChatRoom';
import styles from './app.module.css';

interface ChatMessage {
  message_id: string;
  player_id: string;
  content: string;
  timestamp: number;
  type: 'lobby' | 'game' | 'private';
  to?: string;
}

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [rulesVisible, setRulesVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // 👈 Chat messages state

  const gameId = useAppSelector((state) => state.game.gameId);
  const playerId = '12345';
  const otherPlayerIds = ['player1', 'player2']; // 👈 Replace this with actual players in your game

  const gameOver = useAppSelector((state) => state.game.gameOver);
  const message = useAppSelector((state) => state.game.message);
  const playersHands = useAppSelector((state) => state.game.playersHands);
  const dealerHand = useAppSelector((state) => state.game.dealerHand);

  const handleStartGame = () => dispatch(startGame());
  const handleHit = () => dispatch(hit());
  const handleStand = () => dispatch(stand());
  const handleRestartGame = () => dispatch(restartGame());
  const handleJoinGame = (gameId: string, playerId: string) =>
    dispatch(joinGame({ gameId, playerId }));

  const sendMessage = (content: string, type: 'lobby' | 'game' | 'private', to?: string) => {
    const newMsg: ChatMessage = {
      message_id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      player_id: playerId,
      content,
      timestamp: Date.now(),
      type,
      to,
    };

    // TODO: Replace with socket emit or backend dispatch
    console.log('Send this message:', newMsg);

    // Local state update for demo
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const getPlayerName = (id: string) => {
    if (id === playerId) return 'You';
    if (id === 'player1') return 'Alice';
    if (id === 'player2') return 'Bob';
    return id;
  };

  return (
    <div className={styles.app}>
      <div className={styles.leftColumn}>
        <WelcomeBox />

        <div className={styles.gameContainer}>
          {!gameId ? (
            <Lobby currentPlayerId={playerId} />
          ) : (
            <GameArea />
          )}
        </div>
      </div>

      <div className={styles.rightColumn}>
        <SidebarRules
          rulesVisible={rulesVisible}
          setRulesVisible={setRulesVisible}
        />

        <ChatRoom
          roomId="lobby"
          messages={chatMessages}
          currentPlayerId={playerId}
          onSendMessage={sendMessage}
          getPlayerName={getPlayerName}
        />
      </div>
    </div>
  );
};

export default App;

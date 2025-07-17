import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import GameArea from './features/game/GameArea';
import SidebarRules from './components/Sidebar/SidebarRules';
import WelcomeBox from './components/Welcome/WelcomeBox';
import Lobby from './features/lobby/Lobby';
import ChatRoom from './features/chat/ChatRoom';
import styles from './app.module.css';
import ErrorBanner from './features/ErrorBanner/ErrorBanner';
import { clearError } from './features/error/errorSlice';
import {
  addOutgoingMessage,
} from './features/chat/chatSlice';

import { SEND_WS_MESSAGE } from './features/websocket/actionTypes';
import { setPlayerId } from './features/player/playerSlice'; // correct path

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  const playerId = useAppSelector((state) => state.player.playerId);
  const messagesByUser = useAppSelector((state) => state.chat.messagesByUser);
  const currentChatTarget = useAppSelector((state) => state.chat.currentChatTarget);
  const gameId = useAppSelector((state) => state.game.gameId);
  const errorMessage = useAppSelector(state => state.error.message);

  // Load playerId from localStorage and update Redux
  useEffect(() => {

    if (!playerId) {
      const storedId = localStorage.getItem('playerId');
      if (storedId) {
        dispatch(setPlayerId(storedId));
      } else {
        // No playerId yet — trigger websocket connection and request playerId
        console.log("NO playerId, sending request_player_id")
        dispatch({ type: SEND_WS_MESSAGE, payload: { action: 'request_player_id' } });
      }
    }
  }, [playerId, dispatch]);

  // if (!playerId) {
  //   return <div>Connecting and getting player ID...</div>;
  // }

  const sendMessage = (
    content: string,
    type: 'lobby' | 'game' | 'private',
    to?: string
  ) => {
    const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const msgPayload = {
      action: 'chat_message',
      id: messageId,          // changed from message_id
      from: playerId,         // changed from player_id
      content,
      timestamp: Date.now(),
      type,
      to,
    };

    // Add outgoing message locally in Redux state
    dispatch(addOutgoingMessage({
      id: messageId,
      from: playerId,
      content,
      timestamp: msgPayload.timestamp,
      type,
      to,
    }));

    // Send via WebSocket middleware
    dispatch({ type: SEND_WS_MESSAGE, payload: msgPayload });
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
          {!gameId ? <Lobby currentPlayerId={playerId} /> : <GameArea />}
        </div>
      </div>

      <div className={styles.rightColumn}>
        <SidebarRules rulesVisible={false} setRulesVisible={() => {}} />

        <ChatRoom
          messages={messagesByUser[currentChatTarget] ?? []}
          onSendMessage={sendMessage}
          getPlayerName={getPlayerName}
        />
      </div>

      {errorMessage && (
        <ErrorBanner message={errorMessage} onClose={() => dispatch(clearError())} />
      )}
    </div>
  );
};

export default App;

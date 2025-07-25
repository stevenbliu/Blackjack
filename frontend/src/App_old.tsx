import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import SidebarRules from './components/Sidebar/SidebarRules';
import WelcomeBox from './components/Welcome/WelcomeBox';
import Lobby from './features/lobby/Lobby';
import ChatRoom from './features/chat/ChatRoom';
import styles from './App.module.css';
import ErrorBanner from './features/ErrorBanner/ErrorBanner';
import { clearError } from './features/error/errorSlice';
import { addOutgoingMessage } from './features/chat/chatSlice';
import { SEND_WS_MESSAGE } from './features/websocket/types/actionTypes';
import { setPlayerId } from './features/player/playerSlice';
import { Tabletop } from './features/Tabletop/Tabletop';
import Login from './features/auth/LoginPage';
import { selectAuthStatus, selectCurrentUser } from './features/auth/authSlice';
import Navbar from './components/Navbar/Navbar';
import { logout } from './features/auth/authSlice';
import Footer from './components/Footer/Footer';
import Layout from './components/Layout';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showLogin, setShowLogin] = useState(true);

  const playerId = useAppSelector((state) => state.player.playerId);
  const messagesByUser = useAppSelector((state) => state.chat.messagesByUser);
  const currentChatTarget = useAppSelector((state) => state.chat.currentChatTarget);
  const gameId = useAppSelector((state) => state.game.gameId);
  const errorMessage = useAppSelector(state => state.error.message);
  const isAuthenticated = useAppSelector(selectAuthStatus);
  const isGuest = useAppSelector(selectCurrentUser).isGuest;

  // const handleLoginClick = () => {
  //   setShowLogin(true);
  // };

  // const handleLogoutClick = () => {
  //   dispatch(logout());
  //   setShowLogin(false);
  // };

  const sendMessage = (
    content: string,
    type: 'lobby' | 'game' | 'private',
    to?: string
  ) => {
    const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const msgPayload = {
      action: 'chat_message',
      id: messageId,
      from: playerId,
      content,
      timestamp: Date.now(),
      type,
      to,
    };

    dispatch(addOutgoingMessage({
      id: messageId,
      from: playerId ?? "",
      content,
      timestamp: msgPayload.timestamp,
      type,
      to,
    }));

    dispatch({ type: SEND_WS_MESSAGE, payload: msgPayload });
  };

  const getPlayerName = (id: string) => {
    if (id === playerId) return 'You';
    if (id === 'player1') return 'Alice';
    if (id === 'player2') return 'Bob';
    return id;
  };

  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false);
    }
  }, [isAuthenticated]);

  if (showLogin) {
    return (
      <div className={styles.loginOverlay}>
        <Login onSuccess={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className={styles.appRoot}>
      <Layout>

      {/* <Navbar 
        isAuthenticated={isAuthenticated}
        isGuest={isGuest}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogoutClick}
      /> */}

      {isGuest && (
        <div className={styles.guestBanner}>
          Playing as Guest - <button onClick={() => setShowLogin(true)}>Sign In</button>
        </div>
      )}

      <div className={styles.appContent}>
        <div className={styles.leftColumn}>
          <div className={styles.welcomeBoxContainer}>
            <WelcomeBox />
          </div>
          <div className={styles.gameAreaContainer}>
            {!gameId ? (
              <div className={styles.lobbyContainer}>
                <Lobby currentPlayerId={playerId ?? ""} />
              </div>
            ) : (
              <div className={styles.tabletopContainer}>
                <Tabletop />
              </div>
            )}
          </div>
        </div>

        {/* <div className={styles.rightColumn}> */}
          {/* <div className={styles.sidebarContainer}>
            <SidebarRules rulesVisible={false} setRulesVisible={() => {}} />
          </div> */}
          {/* <div className={styles.chatContainer}>
            <ChatRoom
              messages={messagesByUser[currentChatTarget] ?? []}
              onSendMessage={sendMessage}
              getPlayerName={getPlayerName}
            />
          </div> */}
        {/* </div> */}

      </div>

      {errorMessage && (
        <ErrorBanner message={errorMessage} onClose={() => dispatch(clearError())} />
      )}

      {/* <Footer /> */}
    </Layout>

    </div>
  );
};

export default App;
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Removed BrowserRouter import
import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectAuthStatus } from './features/auth/authSlice';

import Layout from './components/Layout';
import HomePage from './pages/home/homePage';
import LobbyPage from './pages/lobby/lobbyPage';
import LeaderboardPage from './pages/leaderboard/leaderboardPage';
import StorePage from './pages/store/storePage';
import Login from './features/auth/LoginPage';
import ErrorBanner from './features/ErrorBanner/ErrorBanner';
import { clearError } from './features/error/errorSlice';
import styles from './App.module.css'
import CatanGame from './features/game/catan/catan'
// import { socket, initSocket  } from './features/websocket/websocketMiddleware';
import socketService   from './features/websocket/socketServiceSingleton';

import { useSelector } from 'react-redux';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showLogin, setShowLogin] = useState(false);
  const errorMessage = useAppSelector(state => state.error.message);
  const isAuthenticated = useAppSelector(selectAuthStatus);

  const token = useSelector((state: RootState) => state.auth.token);
  const username = useSelector((state: RootState) => state.auth.username);
  const user_id = useSelector((state: RootState) => state.auth.userId);

  useEffect(() => {
    console.log("Checking authentication status...", isAuthenticated);
    if (isAuthenticated === 'succeeded') {
      setShowLogin(false);
      console.log(`Auth status is 'succeeded token: ${token.substring(0, 8)}, user: ${username} user_id:${user_id}`);
      socketService.connect(token, username, user_id).catch(console.error);

    }
    else {
      setShowLogin(true);
    }

        return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);


  if (showLogin) {
    return (
      <div className={styles.loginOverlay}>
        <Login onSuccess={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    // <Router>
      <div className={styles.appRoot}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path='/catan' element={<CatanGame />} />
          </Routes>

          {errorMessage && (
            <ErrorBanner 
              message={errorMessage} 
              onClose={() => dispatch(clearError())} 
            />
          )}
        </Layout>
      </div>
    // </Router>
  );
};

export default App;
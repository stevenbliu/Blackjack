import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Removed BrowserRouter import
import { useAppDispatch, useAppSelector } from './app/hooks';
import Layout from './components/Layout';
import HomePage from './pages/home/homePage';
import LobbyPage from './pages/lobby/lobbyPage';
import LeaderboardPage from './pages/leaderboard/leaderboardPage';
import StorePage from './pages/store/storePage';
import Login from './features/auth/LoginPage';
import ErrorBanner from './features/ErrorBanner/ErrorBanner';
import { clearError } from './features/error/errorSlice';
import { selectAuthStatus } from './features/auth/authSlice';
import styles from './App.module.css'
import CatanGame from './features/game/catan/catan'
import { initSocket  } from './features/websocket/websocketMiddleware';
import { useSelector } from 'react-redux';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showLogin, setShowLogin] = useState(false);
  const isAuthenticated = useAppSelector(selectAuthStatus);
  const errorMessage = useAppSelector(state => state.error.message);

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    console.log("Checking authentication status...", isAuthenticated);
    if (isAuthenticated === 'succeeded') {
      setShowLogin(false);
    }
    else {
      setShowLogin(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated === 'succeeded' && token) {
      console.log("Initializing WebSocket connection with...", token);
      initSocket(token);
    } else {
      console.log("WebSocket connection not initialized.");
    };
  }, [isAuthenticated, token]);

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
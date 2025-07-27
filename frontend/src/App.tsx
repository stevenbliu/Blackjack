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

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showLogin, setShowLogin] = useState(true);
  const isAuthenticated = useAppSelector(selectAuthStatus);
  const errorMessage = useAppSelector(state => state.error.message);

  useEffect(() => {
    console.log("Checking authentication status...");
    if (isAuthenticated) {
      setShowLogin(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    initSocket();
  }, []);

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
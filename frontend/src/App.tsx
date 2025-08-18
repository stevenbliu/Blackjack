import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectAuthStatus } from './features/auth/authSlice';

import Layout from './components/Layout';
import Login from './features/auth/LoginPage';
import ErrorBanner from './features/ErrorBanner/ErrorBanner';
import { clearError } from './features/error/errorSlice';
import styles from './App.module.css';
import socketService from './features/websocket/socketServiceSingleton';
import { useSelector } from 'react-redux';

const HomePage = lazy(() => import('./pages/home/homePage'));
const LobbyPage = lazy(() => import('./pages/lobby/lobbyPage'));
const LeaderboardPage = lazy(() => import('./pages/leaderboard/leaderboardPage'));
const StorePage = lazy(() => import('./pages/store/storePage'));
const CatanGame = lazy(() => import('./features/game/catan/catan'));

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showLogin, setShowLogin] = useState(false);
  const errorMessage = useAppSelector(state => state.error.message);
  const isAuthenticated = useAppSelector(selectAuthStatus);

  const token = useSelector((state: RootState) => state.auth.token);
  const username = useSelector((state: RootState) => state.auth.username);
  const user_id = useSelector((state: RootState) => state.auth.userId);

  useEffect(() => {
    if (isAuthenticated === 'succeeded') {
      setShowLogin(false);
      socketService.connect(token, username, user_id).catch(console.error);
    } else {
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
    <div className={styles.appRoot}>
      <Layout>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/catan" element={<CatanGame />} />
          </Routes>
        </Suspense>

        {errorMessage && (
          <ErrorBanner
            message={errorMessage}
            onClose={() => dispatch(clearError())}
          />
        )}
      </Layout>
    </div>
  );
};

export default App;

import React, { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { initLobby, fetchRooms, createGame, setCurrentPage } from './lobbySlice';
import { setGameId } from '../game/gameSlice';
import { SEND_WS_MESSAGE } from '../websocket/actionTypes';
import RoomList from './components/RoomList/RoomList';
import styles from './Lobby.module.css';

type LobbyProps = {
  currentPlayerId: string;
};

const POLL_INTERVAL_MS = 105000; // 5 seconds polling
const PAGE_LIMIT = 3;

const Lobby: React.FC<LobbyProps> = ({ currentPlayerId }) => {
  const dispatch = useAppDispatch();
  const { gameRooms, loading, creating, socketError, currentPage, totalPages } = useSelector(
    (state: RootState) => state.lobby
  );
  const pageRef = useRef(currentPage);
  pageRef.current = currentPage;

  useEffect(() => {
    dispatch(initLobby());

    // Initial fetch of first page
    dispatch(fetchRooms({ page: 1, limit: PAGE_LIMIT }));

    // Polling with current page param
    console.log('[Polling] Fetching page:', pageRef.current);
    const intervalId = setInterval(() => {
      dispatch(fetchRooms({ page: pageRef.current, limit: PAGE_LIMIT }));
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleCreateGame = async () => {
    try {
      await dispatch(createGame(currentPlayerId)).unwrap();
      // Refresh room list to first page after creating a game
      dispatch(fetchRooms({ page: 1, limit: PAGE_LIMIT }));
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  const handleJoinGame = (gameId: string) => {
    dispatch(setGameId(gameId));
    dispatch({
      type: SEND_WS_MESSAGE,
      payload: { action: 'join_game', gameId, playerId: currentPlayerId },
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage)); // 👈 ensure Redux state updates immediately
      dispatch(fetchRooms({ page: newPage, limit: PAGE_LIMIT }));
    }
  };

  return (
    <div className={styles.lobby}>
      <h2>Lobby</h2>

      {socketError && <div className={styles.error}>{socketError}</div>}

      <button onClick={handleCreateGame} disabled={creating}>
        {creating ? 'Creating...' : 'Create New Game'}
      </button>

      <button onClick={() => dispatch(fetchRooms({ page: currentPage, limit: PAGE_LIMIT }))} disabled={loading}>
        ⟲ Refresh
      </button>

      <div className={styles.roomList}>
        {loading ? (
          Array(5)
            .fill(null)
            .map((_, idx) => <div key={idx} className={styles.skeletonRoom}></div>)
        ) : gameRooms.length > 0 ? (
          <RoomList games={gameRooms} onJoin={handleJoinGame} />
        ) : (
          <div>No active games. Create one!</div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className={styles.pagination}>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Lobby;

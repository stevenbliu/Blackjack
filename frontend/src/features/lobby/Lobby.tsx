import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { initLobby, setCurrentPage } from './lobbySlice';
import { SEND_WS_MESSAGE } from '../websocket/types/actionTypes';
import RoomList from './components/RoomList/RoomList';
import styles from './Lobby.module.css';

type LobbyProps = {
  currentPlayerId: string;
};

// Fake game rooms data
const fakeGameRooms = [
  {
    id: 'room1',
    name: 'Beginner Table',
    players: [
      { id: 'player1', name: 'Alice', ready: true },
      { id: 'player2', name: 'Bob', ready: false }
    ],
    maxPlayers: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago,
    date: '123213',
  },
  {
    id: 'room2',
    name: 'Tournament Qualifier',
    players: [
      { id: 'player3', name: 'Charlie', ready: true },
      { id: 'player4', name: 'Dana', ready: true },
      { id: 'player5', name: 'Eve', ready: false }
    ],
    maxPlayers: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
  },
  {
    id: 'room3',
    name: 'VIP High Stakes',
    players: [{ id: 'player6', name: 'Frank', ready: false }],
    maxPlayers: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString() // 2 minutes ago
  },
  {
    id: 'room4',
    name: 'Casual Play',
    players: [
      { id: 'player7', name: 'Grace', ready: true },
      { id: 'player8', name: 'Hank', ready: true }
    ],
    maxPlayers: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
  },
  {
    id: 'room5',
    name: 'Learning Zone',
    players: [{ id: 'player9', name: 'Ivy', ready: false }],
    maxPlayers: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 minutes ago
  }
];

const POLL_INTERVAL_MS = 5000; // 5 seconds polling
const PAGE_LIMIT = 3;

const Lobby: React.FC<LobbyProps> = ({ currentPlayerId }) => {
  const dispatch = useAppDispatch();
  const { loading, creating, socketError, currentPage } = useSelector(
    (state: RootState) => state.lobby
  );
  
  // Use fake data instead of Redux state
  const [paginatedRooms, setPaginatedRooms] = useState(fakeGameRooms.slice(0, PAGE_LIMIT));
  const [totalFakePages] = useState(Math.ceil(fakeGameRooms.length / PAGE_LIMIT));

  const pageRef = useRef(currentPage);
  pageRef.current = currentPage;

  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [gameName, setGameName] = useState('');
  // const [maxPlayers] = useState(2);

  useEffect(() => {
    dispatch(initLobby());
    
    // Simulate polling with fake data
    const intervalId = setInterval(() => {
      console.log('[Polling] Refreshing fake rooms');
      updatePaginatedRooms(currentPage);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [dispatch, currentPage]);

  const updatePaginatedRooms = (page: number) => {
    const start = (page - 1) * PAGE_LIMIT;
    const end = start + PAGE_LIMIT;
    setPaginatedRooms(fakeGameRooms.slice(start, end));
  };

  // const handleCreateGame = async () => {
  //   try {
  //     // Create a new fake room
  //     const newRoom = {
  //       id: `room${fakeGameRooms.length + 1}`,
  //       name: gameName,
  //       players: [{ id: currentPlayerId, name: 'You', ready: false }],
  //       maxPlayers,
  //       createdAt: new Date().toISOString()
  //     };
      
  //     fakeGameRooms.unshift(newRoom); // Add to beginning
  //     updatePaginatedRooms(1); // Reset to first page
      
  //     setShowCreateModal(false);
  //     setGameName('');
  //   } catch (err) {
  //     console.error('Create game failed:', err);
  //     alert('Failed to create game: ' + err);
  //   }
  // };

  const handleJoinGame = (gameId: string) => {
    // Simulate joining a game
    console.log(`Joining game ${gameId}`);
    dispatch({
      type: SEND_WS_MESSAGE,
      payload: { action: 'join_game', gameId, playerId: currentPlayerId },
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalFakePages) {
      dispatch(setCurrentPage(newPage));
      updatePaginatedRooms(newPage);
    }
  };

return (
    <div className={styles.lobbyContainer}>
      <div className={styles.lobbyHeader}>
        <h2>Lobby</h2>
        
        <div className={styles.headerControls}>
          <button 
            // onClick={() => setShowCreateModal(true)} 
            disabled={creating}
            className={styles.createButton}
          >
            {creating ? 'Creating...' : 'Create New Game'}
          </button>
          
          <button 
            onClick={() => updatePaginatedRooms(currentPage)} 
            disabled={loading}
            className={styles.refreshButton}
          >
            ⟲ Refresh
          </button>
        </div>
      </div>

      {socketError && <div className={styles.error}>{socketError}</div>}

      {/* Pagination at the top */}
      <div className={styles.paginationTop}>
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage <= 1}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalFakePages}
        </span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage >= totalFakePages}
        >
          Next
        </button>
      </div>

      <div className={styles.roomListContainer}>
        {loading ? (
          Array(3)
            .fill(null)
            .map((_, idx) => <div key={idx} className={styles.skeletonRoom}></div>)
        ) : paginatedRooms.length > 0 ? (
          <RoomList games={paginatedRooms} onJoin={handleJoinGame} />
          // <h1> asdsad </h1>
          // console.log('123123');
        ) : (
          <div className={styles.noGames}>No active games. Create one!</div>
        )}
      </div>

      {/* Pagination at the bottom */}
      <div className={styles.paginationBottom}>
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage <= 1}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalFakePages}
        </span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage >= totalFakePages}
        >
          Next
        </button>
      </div>
      </div>
  );
};

export default Lobby;
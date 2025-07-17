import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { useSelector } from 'react-redux';
import { initLobby, fetchRooms, createGame, setCurrentPage } from './lobbySlice';
import { setGameId } from '../game/gameSlice';
import { SEND_WS_MESSAGE } from '../websocket/actionTypes';
import RoomList from './components/RoomList/RoomList';
import styles from './Lobby.module.css';
const POLL_INTERVAL_MS = 105000; // 5 seconds polling
const PAGE_LIMIT = 3;
const Lobby = ({ currentPlayerId }) => {
    const dispatch = useAppDispatch();
    const { gameRooms, loading, creating, socketError, currentPage, totalPages } = useSelector((state) => state.lobby);
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
        }
        catch (error) {
            console.error('Failed to create game:', error);
        }
    };
    const handleJoinGame = (gameId) => {
        dispatch(setGameId(gameId));
        dispatch({
            type: SEND_WS_MESSAGE,
            payload: { action: 'join_game', gameId, playerId: currentPlayerId },
        });
    };
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch(setCurrentPage(newPage)); // 👈 ensure Redux state updates immediately
            dispatch(fetchRooms({ page: newPage, limit: PAGE_LIMIT }));
        }
    };
    return (_jsxs("div", { className: styles.lobby, children: [_jsx("h2", { children: "Lobby" }), socketError && _jsx("div", { className: styles.error, children: socketError }), _jsx("button", { onClick: handleCreateGame, disabled: creating, children: creating ? 'Creating...' : 'Create New Game' }), _jsx("button", { onClick: () => dispatch(fetchRooms({ page: currentPage, limit: PAGE_LIMIT })), disabled: loading, children: "\u27F2 Refresh" }), _jsx("div", { className: styles.roomList, children: loading ? (Array(5)
                    .fill(null)
                    .map((_, idx) => _jsx("div", { className: styles.skeletonRoom }, idx))) : gameRooms.length > 0 ? (_jsx(RoomList, { games: gameRooms, onJoin: handleJoinGame })) : (_jsx("div", { children: "No active games. Create one!" })) }), _jsxs("div", { className: styles.pagination, children: [_jsx("button", { onClick: () => handlePageChange(currentPage - 1), disabled: currentPage <= 1, children: "Prev" }), _jsxs("span", { children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { onClick: () => handlePageChange(currentPage + 1), disabled: currentPage >= totalPages, children: "Next" })] })] }));
};
export default Lobby;

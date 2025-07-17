import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import SidebarRules from './components/Sidebar/SidebarRules';
import WelcomeBox from './components/Welcome/WelcomeBox';
import Lobby from './features/lobby/Lobby';
import ChatRoom from './features/chat/ChatRoom';
import styles from './App.module.css';
import ErrorBanner from './features/ErrorBanner/ErrorBanner';
import { clearError } from './features/error/errorSlice';
import { addOutgoingMessage, } from './features/chat/chatSlice';
import { SEND_WS_MESSAGE } from './features/websocket/actionTypes';
import { setPlayerId } from './features/player/playerSlice'; // correct path
const App = () => {
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
            }
            else {
                // No playerId yet — trigger websocket connection and request playerId
                console.log("NO playerId, sending request_player_id");
                dispatch({ type: SEND_WS_MESSAGE, payload: { action: 'request_player_id' } });
            }
        }
    }, [playerId, dispatch]);
    // if (!playerId) {
    //   return <div>Connecting and getting player ID...</div>;
    // }
    const sendMessage = (content, type, to) => {
        const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const msgPayload = {
            action: 'chat_message',
            id: messageId, // changed from message_id
            from: playerId, // changed from player_id
            content,
            timestamp: Date.now(),
            type,
            to,
        };
        // Add outgoing message locally in Redux state
        dispatch(addOutgoingMessage({
            id: messageId,
            from: playerId ?? "",
            content,
            timestamp: msgPayload.timestamp,
            type,
            to,
        }));
        // Send via WebSocket middleware
        dispatch({ type: SEND_WS_MESSAGE, payload: msgPayload });
    };
    const getPlayerName = (id) => {
        if (id === playerId)
            return 'You';
        if (id === 'player1')
            return 'Alice';
        if (id === 'player2')
            return 'Bob';
        return id;
    };
    return (_jsxs("div", { className: styles.app, children: [_jsxs("div", { className: styles.leftColumn, children: [_jsx(WelcomeBox, {}), _jsx("div", { className: styles.gameContainer, children: !gameId ? (_jsx(Lobby, { currentPlayerId: playerId ?? "" })) : (
                        // <GameArea
                        //   gameId={gameId}
                        //   gameOver={false}
                        //   message=""
                        //   startGame={() => {}}
                        //   playerHand={[]}
                        //   dealerHand={[]}
                        //   playerScore={0}
                        //   dealerScore={0}
                        //   onHit={() => {}}
                        //   onStand={() => {}}
                        // />
                        _jsx("div", { children: "Temp Game Area" })) })] }), _jsxs("div", { className: styles.rightColumn, children: [_jsx(SidebarRules, { rulesVisible: false, setRulesVisible: () => { } }), _jsx(ChatRoom, { messages: messagesByUser[currentChatTarget] ?? [], onSendMessage: sendMessage, getPlayerName: getPlayerName })] }), errorMessage && (_jsx(ErrorBanner, { message: errorMessage, onClose: () => dispatch(clearError()) }))] }));
};
export default App;

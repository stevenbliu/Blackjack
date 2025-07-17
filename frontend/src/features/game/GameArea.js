import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/features/game/GameArea.tsx
import { useEffect, useState } from 'react';
import Controls from './components/Controls';
import MessageZone from './components/MessageZone';
import Card from './components/Card';
import styles from './GameArea.module.css';
const GameArea = ({ gameId, gameOver, message, startGame, hit, stand, restartGame, playersHands, dealerHand, playerId, joinGame, }) => {
    const [animateHands, setAnimateHands] = useState([]);
    useEffect(() => {
        if (gameId) {
            setAnimateHands(new Array(playersHands.length + 1).fill(true));
        }
    }, [gameId, playersHands.length]);
    const handleJoinGame = async () => {
        if (gameId) {
            try {
                await joinGame(gameId, playerId);
            }
            catch (err) {
                console.error("Failed to join game:", err);
            }
        }
    };
    return (_jsxs("div", { className: styles.gameArea, children: [_jsx("div", { className: styles.topRight, children: gameId && _jsxs("h3", { children: ["Game ID: ", _jsx("span", { style: { color: '#00e676' }, children: gameId })] }) }), _jsx("div", { className: styles.topMiddle, children: _jsx(MessageZone, { message: message }) }), gameId ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: styles.dealerZone, children: [_jsx("div", { className: styles.zoneTitle, children: "\uD83C\uDFA9 Dealer Hand" }), _jsx("div", { className: styles.cardContainer, children: dealerHand.map((card, i) => (_jsx(Card, { cardName: card.CardName, isFaceUp: i !== 1 || gameOver, animate: animateHands[playersHands.length], position: i }, i))) })] }), _jsx("div", { className: styles.playerZones, children: playersHands.map((hand, index) => (_jsxs("div", { className: styles.playerZone, children: [_jsxs("div", { className: styles.zoneTitle, children: ["\uD83E\uDDD1 Player ", index + 1] }), _jsx("div", { className: styles.cardContainer, children: hand.map((card, i) => (_jsx(Card, { cardName: card.CardName, isFaceUp: true, animate: animateHands[index], position: i }, i))) })] }, index))) }), _jsx("div", { className: styles.bottomLeft, children: _jsx(Controls, { onHit: hit, onStand: stand, onRestart: restartGame, disabled: gameOver }) })] })) : (
            // If no game started
            _jsx("div", { className: styles.gameTitle, children: _jsx("button", { onClick: startGame, className: styles.startButton, children: "Start Game" }) })), gameId && (_jsx("div", { className: styles.gameTitle, children: _jsx("button", { onClick: handleJoinGame, className: styles.joinButton, children: "Join Game" }) }))] }));
};
export default GameArea;

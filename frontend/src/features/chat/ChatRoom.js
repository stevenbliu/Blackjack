import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks'; // adjust path as needed
import { SEND_WS_MESSAGE } from '../websocket/actionTypes';
import { addOutgoingMessage } from './chatSlice';
import { useSelector } from 'react-redux';
const ChatRoom = ({ getPlayerName, }) => {
    const dispatch = useAppDispatch();
    const currentPlayerId = useSelector((state) => state.player.playerId);
    const [newMessage, setNewMessage] = useState('');
    const [selectedTab, setSelectedTab] = useState('lobby');
    const [openPrivateTabs, setOpenPrivateTabs] = useState([]);
    const [unreadMap, setUnreadMap] = useState({});
    const messagesEndRef = useRef(null);
    const messagesByUser = useAppSelector((state) => state.chat.messagesByUser);
    const messages = Object.values(messagesByUser).flat();
    const filteredMessages = messages.filter((msg) => {
        if (selectedTab === 'lobby')
            return msg.type === 'lobby';
        if (selectedTab === 'game')
            return msg.type === 'game';
        return (msg.type === 'private' &&
            ((msg.from === selectedTab && msg.to === currentPlayerId) ||
                (msg.from === currentPlayerId && msg.to === selectedTab)));
    });
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredMessages]);
    useEffect(() => {
        messages.forEach((msg) => {
            if (msg.type === 'private') {
                const otherId = msg.from === currentPlayerId ? msg.to : msg.from;
                if (!otherId || otherId === currentPlayerId)
                    return;
                if (!openPrivateTabs.includes(otherId)) {
                    setOpenPrivateTabs((prev) => [...prev, otherId]);
                    setUnreadMap((prev) => ({ ...prev, [otherId]: 1 }));
                }
                else if (otherId !== selectedTab) {
                    setUnreadMap((prev) => ({
                        ...prev,
                        [otherId]: (prev[otherId] || 0) + 1,
                    }));
                }
            }
        });
    }, [messages]);
    useEffect(() => {
        if (selectedTab !== 'lobby' && selectedTab !== 'game') {
            setUnreadMap((prev) => {
                const newMap = { ...prev };
                delete newMap[selectedTab];
                return newMap;
            });
        }
    }, [selectedTab]);
    const handleSend = () => {
        const trimmed = newMessage.trim();
        if (!trimmed)
            return;
        const msg = {
            id: crypto.randomUUID(),
            // id: 3,
            from: currentPlayerId ?? '',
            content: trimmed,
            timestamp: Date.now(),
            type: selectedTab === 'lobby' || selectedTab === 'game' ? selectedTab : 'private',
            to: selectedTab !== 'lobby' && selectedTab !== 'game' ? selectedTab : undefined,
        };
        dispatch({ type: SEND_WS_MESSAGE, payload: { action: 'chat_message', ...msg } });
        dispatch(addOutgoingMessage(msg));
        setNewMessage('');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const renderTabButton = (key, label) => (_jsxs("div", { style: { position: 'relative' }, children: [_jsxs("button", { onClick: () => setSelectedTab(key), style: {
                    padding: '6px 10px',
                    backgroundColor: selectedTab === key ? '#007bff' : '#f0f0f0',
                    color: selectedTab === key ? 'white' : 'black',
                    border: 'none',
                    fontWeight: selectedTab === key ? 'bold' : 'normal',
                    cursor: 'pointer',
                    fontSize: 13,
                    marginRight: 6,
                    borderRadius: 6,
                }, children: [label, unreadMap[key] && (_jsx("span", { style: { marginLeft: 6, color: 'red', fontWeight: 'bold', fontSize: 12 }, children: "\u2022" }))] }), key !== 'lobby' && key !== 'game' && (_jsx("span", { onClick: () => setOpenPrivateTabs((prev) => prev.filter((id) => id !== key)), style: {
                    position: 'absolute',
                    top: 0,
                    right: -6,
                    color: 'red',
                    fontSize: 12,
                    cursor: 'pointer',
                    padding: '2px',
                }, children: "\u274C" }))] }, key));
    return (_jsxs("div", { style: {
            border: '1px solid #ccc',
            padding: 10,
            width: 350,
            display: 'flex',
            flexDirection: 'column',
            height: 500,
        }, children: [_jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }, children: [renderTabButton('lobby', 'Lobby'), renderTabButton('game', 'Game'), openPrivateTabs.map((pid) => renderTabButton(pid, getPlayerName ? getPlayerName(pid) : `Private: ${pid}`))] }), _jsxs("div", { style: { flex: 1, overflowY: 'auto', marginBottom: 10 }, children: [filteredMessages.length === 0 && (_jsx("p", { style: { color: '#666' }, children: "No messages in this chat yet." })), filteredMessages.map((msg) => {
                        const isMe = msg.from === currentPlayerId;
                        const displayName = getPlayerName ? getPlayerName(msg.from) : msg.from;
                        const timeString = new Date(msg.timestamp).toLocaleTimeString();
                        //   console.log(msg, currentPlayerId)
                        return (_jsxs("div", { style: { marginBottom: 8, textAlign: isMe ? 'right' : 'left' }, children: [!isMe && (_jsx("div", { style: { fontWeight: 'bold', fontSize: 12 }, children: displayName })), _jsx("div", { style: {
                                        display: 'inline-block',
                                        backgroundColor: isMe ? '#007bff' : '#e5e5ea',
                                        color: isMe ? 'white' : 'black',
                                        borderRadius: 12,
                                        padding: '6px 12px',
                                        maxWidth: '80%',
                                        wordWrap: 'break-word',
                                        fontSize: 14,
                                    }, children: msg.content }), _jsx("div", { style: { fontSize: 10, color: '#999' }, children: timeString })] }, msg.id));
                    }), _jsx("div", { ref: messagesEndRef })] }), _jsx("textarea", { rows: 2, value: newMessage, placeholder: "Type your message...", onChange: (e) => setNewMessage(e.target.value), onKeyDown: handleKeyDown, style: { resize: 'none', padding: 6, fontSize: 14 } }), _jsx("button", { onClick: handleSend, disabled: !newMessage.trim(), style: { marginTop: 6 }, children: "Send" })] }));
};
export default ChatRoom;

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector} from '../../app/hooks'; // adjust path as needed
import { SEND_WS_MESSAGE } from '../websocket/actionTypes';
import { addOutgoingMessage } from './chatSlice';
import { current } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store'; // adjust the path based on your file structure


interface ChatMessage {
  id: string;         // message id
  from: string;       // sender player id
  to?: string;        // recipient player id for private messages
  content: string;
  timestamp: number;
  type: 'lobby' | 'game' | 'private';
}


type MessageType = 'lobby' | 'game' | 'private';

interface ChatRoomProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, type: MessageType, to?: string) => void;
  getPlayerName: (id: string) => string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  getPlayerName,
}) => {
  const dispatch = useAppDispatch();
  const currentPlayerId = useSelector((state: RootState) => state.player.playerId);


  const [newMessage, setNewMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState<'lobby' | 'game' | string>('lobby');
  const [openPrivateTabs, setOpenPrivateTabs] = useState<string[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesByUser = useAppSelector((state) => state.chat.messagesByUser);
  const messages = Object.values(messagesByUser).flat();

  const filteredMessages = messages.filter((msg) => {
    if (selectedTab === 'lobby') return msg.type === 'lobby';
    if (selectedTab === 'game') return msg.type === 'game';
    return (
      msg.type === 'private' &&
      ((msg.from === selectedTab && msg.to === currentPlayerId) ||
        (msg.from === currentPlayerId && msg.to === selectedTab))
    );
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.type === 'private') {
        const otherId = msg.from === currentPlayerId ? msg.to : msg.from;
        if (!otherId || otherId === currentPlayerId) return;

        if (!openPrivateTabs.includes(otherId)) {
          setOpenPrivateTabs((prev) => [...prev, otherId]);
          setUnreadMap((prev) => ({ ...prev, [otherId]: 1 }));
        } else if (otherId !== selectedTab) {
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
    if (!trimmed) return;

    const msg: ChatMessage = {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderTabButton = (key: string, label: string) => (
    <div key={key} style={{ position: 'relative' }}>
      <button
        onClick={() => setSelectedTab(key)}
        style={{
          padding: '6px 10px',
          backgroundColor: selectedTab === key ? '#007bff' : '#f0f0f0',
          color: selectedTab === key ? 'white' : 'black',
          border: 'none',
          fontWeight: selectedTab === key ? 'bold' : 'normal',
          cursor: 'pointer',
          fontSize: 13,
          marginRight: 6,
          borderRadius: 6,
        }}
      >
        {label}
        {unreadMap[key] && (
          <span style={{ marginLeft: 6, color: 'red', fontWeight: 'bold', fontSize: 12 }}>
            •
          </span>
        )}
      </button>
      {key !== 'lobby' && key !== 'game' && (
        <span
          onClick={() =>
            setOpenPrivateTabs((prev) => prev.filter((id) => id !== key))
          }
          style={{
            position: 'absolute',
            top: 0,
            right: -6,
            color: 'red',
            fontSize: 12,
            cursor: 'pointer',
            padding: '2px',
          }}
        >
          ❌
        </span>
      )}
    </div>
  );

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: 10,
        width: 350,
        display: 'flex',
        flexDirection: 'column',
        height: 500,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {renderTabButton('lobby', 'Lobby')}
        {renderTabButton('game', 'Game')}
        {openPrivateTabs.map((pid) =>
          renderTabButton(pid, getPlayerName ? getPlayerName(pid) : `Private: ${pid}`)
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 10 }}>
        {filteredMessages.length === 0 && (
          <p style={{ color: '#666' }}>No messages in this chat yet.</p>
        )}
        {filteredMessages.map((msg) => {
          const isMe = msg.from === currentPlayerId;
          const displayName = getPlayerName ? getPlayerName(msg.from) : msg.from;
          const timeString = new Date(msg.timestamp).toLocaleTimeString();
        //   console.log(msg, currentPlayerId)
          return (
            <div key={msg.id} style={{ marginBottom: 8, textAlign: isMe ? 'right' : 'left' }}>
              {!isMe && (
                <div style={{ fontWeight: 'bold', fontSize: 12 }}>{displayName}</div>
              )}
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: isMe ? '#007bff' : '#e5e5ea',
                  color: isMe ? 'white' : 'black',
                  borderRadius: 12,
                  padding: '6px 12px',
                  maxWidth: '80%',
                  wordWrap: 'break-word',
                  fontSize: 14,
                }}
              >
                {msg.content}
              </div>
              <div style={{ fontSize: 10, color: '#999' }}>{timeString}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <textarea
        rows={2}
        value={newMessage}
        placeholder="Type your message..."
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ resize: 'none', padding: 6, fontSize: 14 }}
      />
      <button
        onClick={handleSend}
        disabled={!newMessage.trim()}
        style={{ marginTop: 6 }}
      >
        Send
      </button>
    </div>
  );
};

export default ChatRoom;

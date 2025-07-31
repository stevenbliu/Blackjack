import React, { useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { addOutgoingMessage, setCurrentChatTarget } from './chatSlice';
import styles from './ChatRoom.module.css';
import { useChatRoom } from './hooks/useChatRoom';
import { useChatNamespace } from './hooks/useChatNamespace';
import { ChatMessagePayload, ChatEvents } from './socketEvents';
import { socketService } from '../websocket/socketServiceSingleton';

const ChatRoom: React.FC = () => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state: RootState) => state.auth.userId);
  const currentUsername = useSelector((state: RootState) => state.auth.username);
  const messagesByUser = useSelector((state: RootState) => state.chat.messagesByUser);
  const currentChatTarget = useSelector((state: RootState) => state.chat.currentChatTarget);

  const [newMessage, setNewMessage] = useState('');
  const [openPrivateTabs, setOpenPrivateTabs] = useState<string[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  const roomId = useChatRoom(currentUserId, currentUsername);

  // Handle incoming socket messages
  const handleIncomingMessage = useCallback((msg: ChatMessagePayload) => {
    console.log('Socket message received:', msg);
    // Dispatch or update state accordingly, e.g.:
    // dispatch(addIncomingMessage(msg));

    if (msg.type === 'private') {
      const otherUserId = msg.user_id === currentUserId ? msg.to : msg.user_id;
      if (!otherUserId) return;

      setOpenPrivateTabs((tabs) => (tabs.includes(otherUserId) ? tabs : [...tabs, otherUserId]));

      if (otherUserId !== currentChatTarget) {
        setUnreadMap((prev) => ({
          ...prev,
          [otherUserId]: (prev[otherUserId] ?? 0) + 1,
        }));
      }
    }
  }, [currentUserId, currentChatTarget]);

  useChatNamespace(roomId, currentUserId, currentUsername, handleIncomingMessage);

  // Combine and filter messages
  const messages = Object.values(messagesByUser).flat();
  const filteredMessages = messages.filter(msg => {
    if (currentChatTarget === 'lobby') return msg.type === 'lobby';
    if (currentChatTarget === 'game') return msg.type === 'game';
    return msg.type === 'private' &&
      ((msg.user_id === currentChatTarget && msg.to === currentUserId) ||
        (msg.user_id === currentUserId && msg.to === currentChatTarget));
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  // Clear unread count on tab change
  React.useEffect(() => {
    if (currentChatTarget !== 'lobby' && currentChatTarget !== 'game') {
      setUnreadMap((prev) => {
        const copy = { ...prev };
        delete copy[currentChatTarget];
        return copy;
      });
    }
  }, [currentChatTarget]);

  // Send message helper
  const sendMessage = (content: string, type: ChatMessagePayload['type'], recipient?: string) => {
    if (!content.trim() || !currentUserId || !currentUsername || !roomId) return;

    const message: ChatMessagePayload = {
      id: crypto.randomUUID(),
      user_id: currentUserId,
      username: currentUsername,
      message: content,
      timestamp: Date.now(),
      type,
      to: type === 'private' ? recipient : undefined,
      messageStatus: 'sent',
    };

    socketService.sendToNamespace({
      namespace: 'chat',
      event: ChatEvents.MESSAGE,
      data: {
        room_id: 'lobby',
        ...message,
      },
    });

    dispatch(addOutgoingMessage(message));
  };

  const handleSend = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    sendMessage(
      trimmed,
      currentChatTarget === 'lobby' || currentChatTarget === 'game' ? currentChatTarget : 'private',
      currentChatTarget !== 'lobby' && currentChatTarget !== 'game' ? currentChatTarget : undefined,
    );

    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderTabButton = (key: string, label: string) => (
    <div key={key} className={styles.tabButtonWrapper}>
      <button
        onClick={() => dispatch(setCurrentChatTarget(key))}
        className={`${styles.tabButton} ${currentChatTarget === key ? styles.tabButtonSelected : ''}`}
        aria-label={`Switch to ${label} chat tab`}
      >
        {label}
        {unreadMap[key] && (
          <span className={styles.unreadDot} aria-label={`${unreadMap[key]} unread messages`}>
            •
          </span>
        )}
      </button>
      {key !== 'lobby' && key !== 'game' && (
        <span
          onClick={() => setOpenPrivateTabs((prev) => prev.filter((id) => id !== key))}
          className={styles.closePrivateTab}
          role="button"
          aria-label={`Close private chat with user ${key}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setOpenPrivateTabs((prev) => prev.filter((id) => id !== key));
            }
          }}
        >
          ❌
        </span>
      )}
    </div>
  );

  return (
    <div className={styles.container} role="region" aria-label="Chat room">
      <div className={styles.tabList} role="tablist">
        {renderTabButton('lobby', 'Lobby')}
        {renderTabButton('game', 'Game')}
        {openPrivateTabs.map((pid) => renderTabButton(pid, `User: ${pid}`))}
      </div>

      <div className={styles.messageList} aria-live="polite" aria-relevant="additions">
        {filteredMessages.length === 0 && <p className={styles.noMessages}>No messages in this chat yet.</p>}
        {filteredMessages.map((msg) => {
          const isMe = msg.user_id === currentUserId;
          const timeString = new Date(msg.timestamp).toLocaleTimeString();
          return (
            <div
              key={msg.id}
              className={`${styles.messageContainer} ${isMe ? styles.messageRight : styles.messageLeft}`}
            >
              {!isMe && <div className={styles.senderName}>{msg.username}</div>}
              <div className={isMe ? styles.messageBubbleRight : styles.messageBubbleLeft}>{msg.content}</div>
              <div className={styles.messageTimestamp}>{timeString}</div>
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
        className={styles.textarea}
        aria-label="Chat message input"
      />
      <button
        onClick={handleSend}
        disabled={!newMessage.trim()}
        className={styles.sendButton}
        aria-label="Send chat message"
      >
        Send
      </button>
    </div>
  );
};

export default ChatRoom;

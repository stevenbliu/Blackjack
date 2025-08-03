import React, { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import styles from '../ChatRoom.module.css';

const ChatMessages: React.FC = () => {
  const roomId = useSelector((state: RootState) => state.chat.roomId);
  const userId = useSelector((state: RootState) => state.auth.userId);

  const messages = useSelector(
    (state: RootState) => state.chat.messagesByContext[roomId]
  );

  const memoizedMessages = useMemo(() => messages || [], [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [memoizedMessages]);

  return (
    <div className={styles.messageList}>
      {memoizedMessages.length === 0 && (
        <p className={styles.noMessages}>No messages in this chat yet.</p>
      )}

      {memoizedMessages.map((msg) => {
        const isMe = msg.user_id === userId;
        const displayText = msg.text ?? msg.message ?? '[empty message]';
        const formattedTime = new Date(msg.timestamp).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        });

        const initials = msg.user_id
          ? msg.user_id
              .split(' ')
              .map((word) => word[0])
              .join('')
              .toUpperCase()
          : '?';

        return (
          <div
            key={msg.id || `${msg.user_id}-${msg.timestamp}`}
            className={`${styles.messageRow} ${
              isMe ? styles.messageRight : styles.messageLeft
            }`}
          >
            {!isMe && (
              <div className={styles.avatarBlock}>
                <div className={styles.avatarCircle}>{initials}</div>
              </div>
            )}
            <div className={styles.messageBlock}>
              {!isMe && (
                <div className={styles.senderInfo}>
                  <span className={styles.senderName}>{msg.user_id}</span>
                  <span className={styles.messageTimestamp}>{formattedTime}</span>
                </div>
              )}
              <div
                className={
                  isMe ? styles.messageBubbleRight : styles.messageBubbleLeft
                }
              >
                {displayText}
              </div>
              {isMe && (
                <div className={styles.messageTimestampRight}>
                  {formattedTime}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;

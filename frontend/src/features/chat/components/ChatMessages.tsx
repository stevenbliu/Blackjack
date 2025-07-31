// components/ChatMessages.tsx
import React, { useEffect, useRef } from 'react';
import styles from '../ChatRoom.module.css';
import {ChatMessage} from '../dataTypes';



type Props = {
  messages: ChatMessage[];
  userId: string;
};

const ChatMessages: React.FC<Props> = ({ messages, userId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    console.log("message component ", messages);
  }, [messages]);

  return (
    <div className={styles.messageList}>
      {messages.length === 0 && (
        <p className={styles.noMessages}>No messages in this chat yet.</p>
      )}

      {messages.map((msg) => {
        const isMe = msg.user_id === userId;
        console.log("message ids", msg.user_id, userId)
        const displayText = msg.text ?? msg.message ?? '[empty message]';
        const formattedTime = new Date(msg.timestamp).toLocaleTimeString();

        return (
          <div
            key={msg.id}
            className={`${styles.messageContainer} ${
              isMe ? styles.messageRight : styles.messageLeft
            }`}
          >
            {!isMe && <div className={styles.senderName}>{msg.username}</div>}
            <div
              className={
                isMe ? styles.messageBubbleRight : styles.messageBubbleLeft
              }
            >
              {displayText}
            </div>
            <div className={styles.messageTimestamp}>{formattedTime}</div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;

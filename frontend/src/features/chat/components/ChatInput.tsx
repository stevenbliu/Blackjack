import React, { KeyboardEvent, ChangeEvent } from 'react';
import styles from '../ChatRoom.module.css';

interface ChatInputProps {
  value: string;
  setValue: (value: string) => void;
  onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, setValue, onSend }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend(value.trim());
        setValue('');
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleSendClick = () => {
    if (value.trim()) {
      onSend(value.trim());
      setValue('');
    }
  };

  return (
    <div className={styles.chatInputContainer}>
      <textarea
        rows={2}
        value={value}
        placeholder="Type your message..."
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={styles.textarea}
        aria-label="Chat message input"
      />
      <button
        onClick={handleSendClick}
        disabled={!value.trim()}
        className={styles.sendButton}
        aria-label="Send chat message"
        type="button"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;

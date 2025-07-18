import React from 'react';

interface MessageZoneProps {
  message: string | null;
}

const MessageZone: React.FC<MessageZoneProps> = ({ message }) => {
  return <div style={{ margin: '1rem 0', fontStyle: 'italic' }}>{message}</div>;
};

export default MessageZone;

import React from 'react';

interface MessageZoneProps {
  message: string | null;
}

const MessageZone: React.FC<MessageZoneProps> = ({ message }) => {
  return (
    <div
      style={{
        // marginTop: '20px',
        textAlign: 'center',
        background: '#f0f0f0',
        padding: '10px 20px',
        fontSize: '18px',
        color: message?.toLowerCase().includes('win')
          ? 'green'
          : message?.toLowerCase().includes('lose')
            ? 'red'
            : message?.toLowerCase().includes('draw')
              ? 'blue'
              : 'black',
        fontWeight: 'bold',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        // position: 'fixed',
      }}
    >
      {message || 'Start the game to see your results!'}
    </div>
  );
};

export default MessageZone;

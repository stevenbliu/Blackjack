import React, { createContext, useContext, useRef, useEffect } from 'react';
import { WebSocketManager, WebSocketMessage } from './wsManager';

// export interface WebSocketMessage {
//   action: string;
//   requestId?: string;
//   [key: string]: any;
// }

interface WebSocketContextType {
  connect: () => void;
  send: (message: WebSocketMessage) => Promise<WebSocketMessage>;
  close: () => void;
  onEvent: (handler: (message: WebSocketMessage) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const managerRef = useRef<WebSocketManager | null>(null);
  const readyPromiseRef = useRef<Promise<void> | null>(null);

  const connect = async () => {
    if (managerRef.current) return readyPromiseRef.current!; // ✅ return the existing promise

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const WS_URL = `${protocol}://${window.location.hostname}:8000/ws`;

    const manager = new WebSocketManager(WS_URL);
    console.log('WebSocketManager created:', manager);

    await manager.ready; // <-- WAIT until connected before proceeding
    console.log('WebSocket is now ready!');

    managerRef.current = manager;
    readyPromiseRef.current = manager.ready;

    return readyPromiseRef.current;

  };

  const send = async (message: WebSocketMessage): Promise<WebSocketMessage> => {
    await connect(); // ✅ Ensure ready
    return managerRef.current!.send(message);
  };

  const close = () => {
    managerRef.current?.close();
    managerRef.current = null;
    readyPromiseRef.current = null;
  };

  const onEvent = (handler: (message: WebSocketMessage) => void) => {
    if (!managerRef.current) {
      throw new Error('WebSocket is not connected.');
    }
    managerRef.current.onEvent(handler);
  };

  useEffect(() => {
    let isMounted = true;

    const connectToWebSocket = async () => {
      if (isMounted) {
        await connect();
      }
    };

    connectToWebSocket();  // Establish WebSocket connection when the component mounts

    return () => {
      isMounted = false;
      close(); // Close the WebSocket on component unmount
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ connect, send, close, onEvent }}>
      {children}
    </WebSocketContext.Provider>
  );
};

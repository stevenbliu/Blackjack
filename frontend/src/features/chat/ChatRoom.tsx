// ChatRoom.tsx
import React, {useState} from 'react';
import { useChatManager } from "./hooks/useChatManager";
import { useChatRoom } from './hooks/useChatRoom';
import { useChatNamespace } from './hooks/useChatNamespace';
import { useSelector } from 'react-redux';

import ChatTabs from './components/ChatTabs';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';

import styles from './ChatRoom.module.css';

const ChatRoom = () => {
  const {
    newMessage,
    setNewMessage,
    sendMessage,
  } = useChatManager();

 const userId = useSelector(state => state.auth.userId);
 const username = useSelector(state => state.auth.username);
  // const roomId = useSelector((state: RootState) => state.chat.roomId);
  const messagesByContext = useSelector((state: RootState) => state.chat.messagesByContext);
  // console.log("messages by context", messagesByContext, 'user id:', userId);
  const roomId = 'lobby'

  useChatRoom(userId, username);
  // Hook up the socket namespace and message listener
  useChatNamespace(roomId, userId, username);
  const currentMessages = messagesByContext[roomId] ?? [];

  return (
    <div className={styles.container} role="region" aria-label="Chat room">
      <ChatTabs
        roomId={roomId}
        // openPrivateTabs={openPrivateTabs}
        // unreadMap={unreadMap}
        // dispatch={dispatch}
        // setOpenPrivateTabs={setOpenPrivateTabs}
        // setUnreadMap={setUnreadMap}
      />
      <ChatMessages messages={currentMessages} userId={userId} />
      <ChatInput
        value={newMessage}
        setValue={setNewMessage}
        onSend={() => {
          sendMessage();
          setNewMessage('');
        }}
      />
    </div>
  );
};

export default ChatRoom;

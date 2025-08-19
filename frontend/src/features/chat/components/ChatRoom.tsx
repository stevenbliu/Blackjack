import React from "react";
import { useChatManager } from "../hooks/useChatManager";
import { useChatRoom } from "../hooks/useChatRoom";
import { useChatNamespace } from "../hooks/useChatNamespace";
import { useSelector } from "react-redux";

import ChatTabs from "./ChatTabs";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

import {RootState} from '@/app/store'

const ChatRoom = () => {
  const { newMessage, setNewMessage, sendMessage } = useChatManager();

  const userId = useSelector((state: RootState ) => state.auth.userId);
  const username = useSelector((state: RootState) => state.auth.username);
  // const messagesByContext = useSelector(
  //   (state: RootState) => state.chat.messagesByContext
  // );
  const roomId = "lobby";

  useChatRoom(userId, username);
  useChatNamespace(roomId, userId, username);
  // const currentMessages = messagesByContext[roomId] ?? [];

  return (
    <section
      role="region"
      aria-label="Chat room"
      className="flex flex-col h-full max-h-[600px] w-full max-w-3xl bg-card text-card-foreground rounded-md shadow-md overflow-hidden"
    >
      <ChatTabs currentChatTarget={roomId} />
      {/* <ChatTabs/> */}

      <div className="flex-grow overflow-y-auto px-4">
        {/* <ChatMessages messages={currentMessages} userId={userId} /> */}
        <ChatMessages />
      </div>

      <div className="sticky bottom-0 bg-card p-4 border-t border-border">
        <ChatInput
          value={newMessage}
          setValue={setNewMessage}
          onSend={() => {
            sendMessage();
            setNewMessage("");
          }}
        />
      </div>
    </section>

  );
};

export default ChatRoom;

import React, { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";

const ChatMessages: React.FC = () => {
  const roomId = useSelector((state: RootState) => state.chat.roomId);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const messages = useSelector(
    (state: RootState) => state.chat.messagesByContext[roomId]
  );

  const memoizedMessages = useMemo(() => messages || [], [messages]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [memoizedMessages]);

  if (memoizedMessages.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-4">
        No messages in this chat yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col space-y-3 overflow-y-auto max-h-[400px] p-4">
      {memoizedMessages.map((msg) => {
        const isMe = msg.user_id === userId;
        const displayText = msg.text ?? msg.message ?? "[empty message]";
        const formattedTime = new Date(msg.timestamp).toLocaleTimeString(
          undefined,
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        const initials = msg.user_id
          ? msg.user_id
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()
          : "?";

        return (
          <div
            key={msg.id || `${msg.user_id}-${msg.timestamp}`}
            className={`flex items-end ${
              isMe ? "justify-end" : "justify-start"
            }`}
          >
            {!isMe && (
              <Tooltip content={msg.user_id}>
                <Avatar className="mr-3 w-8 h-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                  {/* Optionally use AvatarImage if you have user pics */}
                  {/* <AvatarImage src={msg.avatarUrl} alt={msg.user_id} /> */}
                </Avatar>
              </Tooltip>
            )}

            <div className="max-w-[70%]">
              {!isMe && (
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-semibold">{msg.user_id}</span>
                  <span className="text-xs text-muted-foreground">
                    {formattedTime}
                  </span>
                </div>
              )}

              <div
                className={`px-4 py-2 rounded-lg break-words ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-muted-foreground rounded-bl-none"
                }`}
              >
                {displayText}
              </div>

              {isMe && (
                <div className="text-xs text-muted-foreground mt-1 text-right">
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

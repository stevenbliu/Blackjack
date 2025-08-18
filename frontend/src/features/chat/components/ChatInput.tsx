import React, { KeyboardEvent, ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  value: string;
  setValue: (value: string) => void;
  onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, setValue, onSend }) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend(value.trim());
        setValue("");
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleSendClick = () => {
    if (value.trim()) {
      onSend(value.trim());
      setValue("");
    }
  };

  return (
    <div className="flex items-center space-x-2 p-4 border-t border-muted-foreground/20">
      <Textarea
        rows={2}
        value={value}
        placeholder="Type your message..."
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label="Chat message input"
        className="resize-none flex-grow"
      />
      <Button
        onClick={handleSendClick}
        disabled={!value.trim()}
        aria-label="Send chat message"
        type="button"
        className="bg-secondary hover:bg-secondary/90 px-4 py-2 rounded-md"
      >
        Send
      </Button>
    </div>
  );
};

export default ChatInput;

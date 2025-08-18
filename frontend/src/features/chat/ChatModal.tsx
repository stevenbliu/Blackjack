import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ChatRoom from "./components/ChatRoom";

import { FaComments, FaTimes } from "react-icons/fa";
import { MdMessage } from "react-icons/md";

export function ChatModal() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="primary"
          className="fixed bottom-6 right-6 rounded-full p-10 bg-white shadow-lg"
          aria-label="Open chat"
        >
          <MdMessage className="!w-10 !h-10" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="top"
        className="w-[320px] p-0 rounded-lg shadow-lg overflow-hidden"
      >
        <div className="relative bg-card h-[600px] flex flex-col">
            <button
              onClick={() => document.activeElement?.blur()} // to close focus after click (optional)
              aria-label="Close"
              className="absolute top-3 right-3 p-1 rounded hover:bg-muted/20 transition"
              onClick={(e) => e.stopPropagation()} // prevent popover from immediately closing
            >
              <FaTimes className="w-5 h-5" />
            </button>


          <header className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Chat</h2>
          </header>

          <main className="flex-grow overflow-auto">
            <ChatRoom />
          </main>
        </div>
      </PopoverContent>
    </Popover>
  );
}

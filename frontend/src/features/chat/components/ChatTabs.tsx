import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatTabsProps {
  currentChatTarget: string;
  onChange?: (key: string) => void;
  // openPrivateTabs?: string[];
  // unreadMap?: Record<string, boolean>;
  // setOpenPrivateTabs?: React.Dispatch<React.SetStateAction<string[]>>;
}

const ChatTabs: React.FC<ChatTabsProps> = ({
  currentChatTarget,
  onChange,
  // openPrivateTabs = [],
  // unreadMap = {},
  // setOpenPrivateTabs,
}) => {
  const handleTabChange = (key: string) => {
    if (onChange) onChange(key);
  };

  // Example close button for private tabs (uncomment and modify if needed)
  // const renderCloseButton = (key: string) => {
  //   if (key === "lobby" || key === "game") return null;
  //   return (
  //     <button
  //       onClick={() =>
  //         setOpenPrivateTabs?.((prev) => prev.filter((id) => id !== key))
  //       }
  //       aria-label={`Close chat with ${key}`}
  //       type="button"
  //       className="ml-2 text-red-500 hover:text-red-700"
  //     >
  //       ❌
  //     </button>
  //   );
  // };

  return (
    <Tabs
      value={currentChatTarget}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="flex space-x-2 border-b border-gray-300 dark:border-gray-700">
        <TabsTrigger
          value="lobby"
          className="px-4 py-2 text-sm font-medium text-gray-700 rounded-t-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Lobby
          {/* {unreadMap?.['lobby'] && (
            <span className="ml-1 text-red-500">•</span>
          )} */}
        </TabsTrigger>
        <TabsTrigger
          value="game"
          className="px-4 py-2 text-sm font-medium text-gray-700 rounded-t-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Game
          {/* {unreadMap?.['game'] && (
            <span className="ml-1 text-red-500">•</span>
          )} */}
        </TabsTrigger>

        {/* Uncomment for private tabs */}
        {/* {openPrivateTabs?.map((pid) => (
          <div key={pid} className="flex items-center">
            <TabsTrigger
              value={pid}
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-t-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              User: {pid}
              {unreadMap?.[pid] && (
                <span className="ml-1 text-red-500">•</span>
              )}
            </TabsTrigger>
            {renderCloseButton(pid)}
          </div>
        ))} */}
      </TabsList>
    </Tabs>
  );
};

export default ChatTabs;

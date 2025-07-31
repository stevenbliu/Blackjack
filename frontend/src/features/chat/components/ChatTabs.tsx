import React from 'react';
import { useDispatch } from 'react-redux';
// import { setCurrentChatTarget } from '../chatSlice';
import styles from '../ChatRoom.module.css';

interface ChatTabsProps {
  currentChatTarget: string;
  // openPrivateTabs: string[];
  // unreadMap: Record<string, boolean>;
  // dispatch?: ReturnType<typeof useDispatch>; // optional if passed manually
  // setOpenPrivateTabs: React.Dispatch<React.SetStateAction<string[]>>;
  // setUnreadMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const ChatTabs: React.FC<ChatTabsProps> = ({
  currentChatTarget,
  // openPrivateTabs,
  // unreadMap,
  // dispatch,
  // setOpenPrivateTabs,
}) => {

  // const handleTabClick = (key: string) => {
  //   dispatch?.(setCurrentChatTarget(key));
  // };

  // const handleCloseTab = (key: string) => {
  //   setOpenPrivateTabs((prev) => prev.filter((id) => id !== key));
  // };

  const renderTabButton = (key: string, label: string) => (
    <div key={key} className={styles.tabButtonWrapper}>
      <button
        type="button"
        // onClick={() => handleTabClick(key)}
        className={`${styles.tabButton} ${
          currentChatTarget === key ? styles.tabButtonSelected : ''
        }`}
        aria-selected={currentChatTarget === key}
        role="tab"
      >
        {label}
        {/* {unreadMap[key] && <span className={styles.unreadDot} aria-label="Unread message">•</span>} */}
      </button>
      {key !== 'lobby' && key !== 'game' && (
        <button
          // onClick={() => handleCloseTab(key)}
          className={styles.closePrivateTab}
          aria-label={`Close chat with ${label}`}
          type="button"
        >
          ❌
        </button>
      )}
    </div>
  );

  return (
    <div className={styles.tabList} role="tablist">
      {renderTabButton('lobby', 'Lobby')}
      {renderTabButton('game', 'Game')}
      {/* {openPrivateTabs.map((pid) => renderTabButton(pid, `User: ${pid}`))} */}
    </div>
  );
};

export default ChatTabs;

// components/Layout.tsx
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAuthStatus, selectCurrentUser } from '../features/auth/authSlice';
import styles from './Layout.module.css'
import ChatRoom from '../features/chat/components/ChatRoom';

export default function Layout({ children }: { children: React.ReactNode }) {

  const authStatus = useAppSelector(selectAuthStatus);
  const isGuest = useAppSelector(selectCurrentUser).isGuest;


  const messagesByUser = useAppSelector((state) => state.chat.messagesByUser);
  const currentChatTarget = useAppSelector((state) => state.chat.currentChatTarget);
  const playerId = useAppSelector((state) => state.player.playerId);


  const sendMessage = (content: string, type: 'lobby' | 'game' | 'private', to?: string) => {
    // ... your existing sendMessage implementation
  };

  const getPlayerName = (id: string) => {
    // ... your existing getPlayerName implementation
  };

  return (
    <>
    <div className={styles.layout}>
      <Navbar
        // authStatus={authStatus}
        // isGuest={isGuest}
        // onLoginClick={handleLoginClick}
        // onLogoutClick={handleLogoutClick}
      />
      <motion.main
        className={styles.mainContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.childrenContainer}>
          {children}
        </div>

        {/* <div className={styles.chatContainer}>
          <ChatRoom
            messages={messagesByUser[currentChatTarget] ?? []}
            onSendMessage={sendMessage}
            getPlayerName={getPlayerName}
          />
        </div> */}
      </motion.main>
      <Footer />
          </div>

    </>
  );
}
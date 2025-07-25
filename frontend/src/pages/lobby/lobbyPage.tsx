import { motion } from 'framer-motion';
import Lobby from '../../features/lobby/Lobby';
import styles from './lobbyPage.module.css';

export default function LobbyPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.lobbyPageContainer}
    >
      <div className={styles.lobbyContent}>
        <Lobby />
      </div>
    </motion.div>
  );
}
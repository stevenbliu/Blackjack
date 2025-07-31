import styles from './catan.module.css'
import CatanBoard from './components/CatanBoard/CatanBoard'
import { TurnController } from './components/TurnController'
import { PlayerPanel } from './components/PlayerPanel'
import ChatRoom from "../../chat/ChatRoom";

export default function CatanGame() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚡ Frontiers of Aether</h1>
      <TurnController />
      <div className={styles.catanBoardWrapper}>
        <CatanBoard />
      </div>
      <PlayerPanel />
      <ChatRoom />
    </div>
  );
}

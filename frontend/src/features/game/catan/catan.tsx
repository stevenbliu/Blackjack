import styles from './catan.module.css'
import React, { Suspense } from "react";
const CatanBoard = React.lazy(() => import('./components/CatanBoard/CatanBoard'));

// import CatanBoard from './components/CatanBoard/CatanBoard'
import DiceRoller from './components/TurnController'
import { PlayerPanel } from './components/PlayerPanel'
import ChatRoom from "../../chat/components/ChatRoom";
// import { Button } from "@/components/ui/button"
import { Button } from "../../../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatModal } from '../../chat/ChatModal';

export default function CatanGame() {
  return (
    // <div className={styles.container}>
    <div className="justify-center items-center h-full w-full bg-card text-card-foreground p-20">
      {/* <h1 className={styles.title}>⚡ Frontiers of Aether</h1> */}
        

    <div className="flex justify-center items-center h-full w-full border border-card-foreground rounded-lg text-card-foreground p-3">
        <Suspense fallback={<div>Loading game...</div>}>
          <CatanBoard />
        </Suspense>
      </div>

      <DiceRoller />

      <PlayerPanel />
      {/* <ChatRoom /> */}
    <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg overflow-hidden">
          <ChatModal />
        </div>
    </div>
  );
}

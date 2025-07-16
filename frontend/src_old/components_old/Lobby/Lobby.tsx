import React, { useEffect } from "react";
import styles from "./Lobby.module.css";
import RoomList from "./RoomList";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  initLobby,
  fetchRooms,
  createGame,
} from "../../redux/slices/lobbySlice";
import { setGameId } from "../../redux/slices/gameSlice";
import { SEND_WS_MESSAGE } from "../../websockets/actionTypes";

type LobbyProps = {
  currentPlayerId: string;
};

const Lobby: React.FC<LobbyProps> = ({ currentPlayerId }) => {
  const dispatch = useDispatch<AppDispatch>(); // Ensure typed dispatch
  const { gameRooms, loading, creating, socketError } = useSelector(
    (state: RootState) => state.lobby
  );

  useEffect(() => {
    dispatch(initLobby());
  }, [dispatch]);

  const handleCreateGame = () => {
    dispatch(createGame(currentPlayerId));
  };

  const handleJoin = (id: string) => {
    dispatch(setGameId(id));
    dispatch({
      type: SEND_WS_MESSAGE,
      payload: {
        type: "join_game",
        gameId: id,
        playerId: currentPlayerId,
      },
    });
  };

  return (
    <div className={styles.lobby}>
      <h2>Lobby</h2>

      {socketError && <div className={styles.error}>{socketError}</div>}

      <button onClick={handleCreateGame} disabled={creating}>
        {creating ? "Creating..." : "Create New Game"}
      </button>

      <button onClick={() => dispatch(fetchRooms())} disabled={loading}>
        ⟲
      </button>

      <div className={styles.roomList}>
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className={styles.skeletonRoom} />
            ))
        ) : gameRooms.length > 0 ? (
          <RoomList games={gameRooms} onJoin={handleJoin} />
        ) : (
          <div>No active games yet. Create one!</div>
        )}
      </div>
    </div>
  );
};

export default Lobby;

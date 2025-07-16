import React from 'react';
import styles from './Lobby.module.css';

type GameRoom = {
  game_id: string;
  players: { id: string; name?: string }[]; // more descriptive than `any[]`
  max_players: number;
};

type RoomListProps = {
  games: GameRoom[];
  onJoin: (gameId: string) => void;
};

const RoomList: React.FC<RoomListProps> = ({ games, onJoin }) => {
  return (
    <>
      {games.map((room) => (
        <div key={room.game_id} className={styles.room}>
          <div>
            <strong>Game ID:</strong> {room.game_id}
          </div>
          <div>
            <strong>Players:</strong> {room.players.length} / {room.max_players}
          </div>
          <button
            onClick={() => {
              console.log('Join button clicked for:', room.game_id);
              onJoin(room.game_id);
            }}
            disabled={room.players.length >= room.max_players}
          >
            Join
          </button>
        </div>
      ))}
    </>
  );
};

export default RoomList;

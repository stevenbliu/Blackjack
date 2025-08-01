import React from 'react';
import styles from './RoomList.module.css';

const isLoggingEnabled = import.meta.env.MODE === 'development';

const log = (...args: any[]) => {
  if (isLoggingEnabled) {
    console.log(...args);
  }
};

type Player = {
  id: string;
  name: string;
  ready: boolean;
};

type GameRoom = {
  game_id: string;
  name: string;
  players: Player[];
  max_players: number;
  createdAt: string;
};

type RoomListProps = {
  games: GameRoom[];
  onJoin: (gameId: string) => void;
};

const RoomList: React.FC<RoomListProps> = ({ games, onJoin }) => {
  log('Rendering RoomList with games:', games);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.roomGrid}>
      {games.map((game) => (
        <div 
          key={game.id} 
          className={styles.roomCard}
          onClick={() => {
            log('Joining game:', game.game_id);
            onJoin(game.game_id);
          }}
        >
          <div className={styles.roomHeader}>
            <h3 className={styles.roomName}>{game.name || `Game ${game.game_id.slice(0, 6)}`}</h3>
            <span className={styles.roomTime}>{formatTime(game.createdAt)}</span>
          </div>
          
          <div className={styles.roomMeta}>
            <span className={styles.playerCount}>
              {game.players.length}/{game.max_players} players
            </span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${(game.players.length / game.max_players) * 100}%` }}
              ></div>
            </div>
          </div>

          <ul className={styles.playerList}>
            {game.players.map((player) => (
              <li key={player.id} className={styles.playerItem}>
                <span className={styles.playerName}>
                  {player.name}
                  {player.id.startsWith('ai_') && ' 🤖'}
                </span>
                <span className={player.ready ? styles.ready : styles.waiting}>
                  {player.ready ? 'Ready ✓' : 'Waiting...'}
                </span>
              </li>
            ))}
          </ul>

          <button
            className={styles.joinButton}
            onClick={(e) => {
              e.stopPropagation();
              log('Button clicked, joining game:', game.game_id);
              onJoin(game.game_id);
            }}
            disabled={game.players.length >= game.max_players}
          >
            {game.players.length >= game.max_players ? 'Full' : 'Join Game'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
import React from 'react';

const isLoggingEnabled = process.env.NODE_ENV === 'development';

const log = (...args: any[]) => {
  if (isLoggingEnabled) {
    console.log(...args);
  }
};

interface GameRoom {
  game_id: string;
  players: string[];
  max_players: number;
}

type RoomListProps = {
  games: GameRoom[];
  onJoin: (gameId: string) => void;
};

const RoomList: React.FC<RoomListProps> = ({ games, onJoin }) => {
  log('Rendering RoomList with games:', games);

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {games.map((game) => {
        log('Rendering game:', game.game_id);
        return (
          <li
            key={game.game_id}
            style={{
              marginBottom: '8px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            onClick={() => {
              log('Joining game:', game.game_id);
              onJoin(game.game_id);
            }}
          >
            <div>
              <strong>Game ID:</strong> {game.game_id}
              <br />
              Players: {game.players.length} / {game.max_players}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                log('Button clicked, joining game:', game.game_id);
                onJoin(game.game_id);
              }}
            >
              Join
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default RoomList;

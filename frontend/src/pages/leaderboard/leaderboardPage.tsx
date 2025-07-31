import { useAppSelector } from '../../app/hooks';
import lbstyles from './leaderboardPage.module.css';
import styles from '../Pages.module.css';


const fakeLeaderboardData = [
  {
    id: '1',
    name: 'DragonSlayer42',
    avatar: 'https://i.pravatar.cc/150?img=1',
    wins: 42,
    losses: 5,
    winRate: 89,
    points: 1250
  },
  {
    id: '2',
    name: 'MagicPanda',
    avatar: 'https://i.pravatar.cc/150?img=2',
    wins: 38,
    losses: 8,
    winRate: 83,
    points: 1120
  },
  {
    id: '3',
    name: 'NinjaTurtle',
    avatar: 'https://i.pravatar.cc/150?img=3',
    wins: 35,
    losses: 10,
    winRate: 78,
    points: 980
  },
  {
    id: '4',
    name: 'PixelWizard',
    avatar: 'https://i.pravatar.cc/150?img=4',
    wins: 30,
    losses: 15,
    winRate: 67,
    points: 875
  },
  {
    id: '5',
    name: 'CosmicQueen',
    avatar: 'https://i.pravatar.cc/150?img=5',
    wins: 28,
    losses: 12,
    winRate: 70,
    points: 820
  },
  {
    id: '6',
    name: 'ShadowHunter',
    avatar: 'https://i.pravatar.cc/150?img=6',
    wins: 25,
    losses: 20,
    winRate: 56,
    points: 750
  },
  {
    id: '7',
    name: 'NeonKnight',
    avatar: 'https://i.pravatar.cc/150?img=7',
    wins: 22,
    losses: 18,
    winRate: 55,
    points: 700
  },
  {
    id: '8',
    name: 'CyberSamurai',
    avatar: 'https://i.pravatar.cc/150?img=8',
    wins: 20,
    losses: 25,
    winRate: 44,
    points: 650
  },
  {
    id: '9',
    name: 'MysticRogue',
    avatar: 'https://i.pravatar.cc/150?img=9',
    wins: 18,
    losses: 22,
    winRate: 45,
    points: 600
  },
  {
    id: '10',
    name: 'AquaMage',
    avatar: 'https://i.pravatar.cc/150?img=10',
    wins: 15,
    losses: 30,
    winRate: 33,
    points: 550
  }
];

export default function LeaderboardPage() {
  // Get leaderboard data from Redux store
//   const leaderboardData = useAppSelector(state => state.leaderboard.players);
//   const isLoading = useAppSelector(state => state.leaderboard.loading);
//   const error = useAppSelector(state => state.leaderboard.error);

    const leaderboardData = fakeLeaderboardData;
    const isLoading = false;
    const error = null;


  return (
    <>
      <div className={lbstyles.leaderboardHeader}>
        <h1 className={lbstyles.sectionTitle}>Player Rankings</h1>
        <div className={lbstyles.sectionSubtitle}>Top performers this season</div>
      </div>

    <div className={`${styles.pageContainer} ${lbstyles.leaderboardPage} ${styles.pageTransition}`}>


      {isLoading ? (
        <div className={lbstyles.loadingMessage}>Loading leaderboard...</div>
      ) : error ? (
        <div className={lbstyles.errorMessage}>{error}</div>
      ) : (
        <table className={lbstyles.leaderboardTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Win Rate</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((player, index) => (
              <tr key={player.id}>
                <td>{index + 1}</td>
                <td>
                  <div className={lbstyles.playerCell}>
                    <img 
                      src={player.avatar} 
                      alt={player.name} 
                      className={lbstyles.playerAvatar}
                    />
                    <span>{player.name}</span>
                  </div>
                </td>
                <td>{player.wins}</td>
                <td>{player.losses}</td>
                <td>{player.winRate}%</td>
                <td>{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </>
  );
}
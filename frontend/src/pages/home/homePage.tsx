import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './homePage.module.css';
import { useSelector } from 'react-redux';

// Card Back Component
const CardBack = ({ delay = 0 }: { delay?: number }) => (
  <motion.div 
    className={styles.cardBack}
    initial={{ rotateY: 0, opacity: 0 }}
    animate={{ 
      rotateY: [0, 180, 360],
      opacity: 1,
      y: [0, -10, 0] // Add slight float
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay
    }}
  >
    <div className={styles.cardPattern}></div>
  </motion.div>
);

// Animated Card Component
const AnimatedCard = ({ suit, value, delay = 0 }: { suit: string; value: string; delay?: number }) => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ 
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1],
      opacity: 1
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 0.5, 1],
      delay: delay
    }}
    className={styles.playingCard}
  >
    <div className={styles.cardValue}>{value}</div>
    <div className={styles.cardSuit}>{suit}</div>
  </motion.div>
);

export default function HomePage() {
  const [stats, setStats] = useState({
    players: 0,
    games: 0,
    tournaments: 0
  });



  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        players: Math.min(prev.players + 23, 10000),
        games: Math.min(prev.games + 5, 500),
        tournaments: Math.min(prev.tournaments + 1, 50)
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Welcome to <span>GameHub</span></h1>
          <p>Join thousands of players in epic card battles</p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryButton}>Play Now</button>
            <button className={styles.secondaryButton}>Learn Rules</button>
          </div>
        </motion.div>

        <div className={styles.cardAnimation}>
          <div className={styles.cardStack}>
            <CardBack delay={0} />
            <AnimatedCard suit="♥" value="A" delay={0.2} />
            <AnimatedCard suit="♠" value="K" delay={0.4} />
            <AnimatedCard suit="♦" value="Q" delay={0.6} />
            <AnimatedCard suit="♣" value="J" delay={0.8} />
          </div>
        </div>
      </section>

      {/* Features & Stats Combined Section */}
      <section className={styles.combinedSection}>
        <div className={styles.features}>
          <h2>Why Play With Us?</h2>
          <div className={styles.featureGrid}>
            {[
              { icon: '⚡', title: 'Fast Matches', desc: '30-second matchmaking' },
              { icon: '🌐', title: 'Global Players', desc: 'Compete worldwide' },
              { icon: '🏆', title: 'Tournaments', desc: 'Weekly competitions' },
              { icon: '💎', title: 'Rewards', desc: 'Earn exclusive prizes' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                className={styles.featureCard}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className={styles.liveStats}>
          <h2>Live Community Stats</h2>
          <div className={styles.statsGrid}>
            {[
              { value: stats.players, label: 'Active Players' },
              { value: stats.games, label: 'Games Daily' },
              { value: stats.tournaments, label: 'Tournaments' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.7 + index * 0.1 }}
                className={styles.statItem}
              >
                <div className={styles.statValue}>
                  {stat.value.toLocaleString()}+
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
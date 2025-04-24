import React from 'react';
import styles from './SidebarRules.module.css';

interface SidebarRulesProps {
  rulesVisible: boolean;
  setRulesVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarRules: React.FC<SidebarRulesProps> = ({ rulesVisible, setRulesVisible }) => {
  return (
    <div className={styles.sidebar}>
      <button
        onClick={() => setRulesVisible(!rulesVisible)}
        className={styles.toggleButton}
      >
        {rulesVisible ? 'Hide Rules' : 'Show Rules'}
      </button>
      {rulesVisible && (
        <div className={styles.rulesContainer}>
          <h3>Rules:</h3>
          <ul className={styles.rulesList}>
            <li>The dealer will draw (hit) cards until they reach 17 or higher.</li>
            <li>You can hit to draw more cards or stand to end your turn.</li>
            <li>If you go over 21, you bust and lose the game.</li>
            <li>If the dealer busts, you win!</li>
            <li>If you and the dealer have the same score, it's a tie.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SidebarRules;

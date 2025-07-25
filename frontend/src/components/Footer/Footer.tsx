// components/Footer/Footer.tsx
import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        
        <div className={styles.footerColumns}>
          <div className={styles.footerColumn}>
            <h4>Resources</h4>
            <ul>
              <li><a href="/rules">Rules</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </div>
          
          <div className={styles.footerColumn}>
            <h4>Company</h4>
            <ul>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/community">Community</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>
          
          <div className={styles.footerColumn}>
            <h4>Legal</h4>
            <ul>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
              <li><a href="/cookies">Cookies</a></li>
            </ul>
          </div>
          
          <div className={styles.footerColumn}>
            <h4>Language</h4>
            <select className={styles.languageSelect}>
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
            </select>
          </div>
        
        <div className = {styles.footerColumn}>

            <div className={styles.socialLinks}>
            <a href="https://discord.gg" aria-label="Discord">
                <i className={`fab fa-discord ${styles.socialIcon}`}></i>
            </a>
            <a href="https://youtube.com" aria-label="YouTube">
                <i className={`fab fa-youtube ${styles.socialIcon}`}></i>
            </a>
            <a href="https://reddit.com" aria-label="Reddit">
                <i className={`fab fa-reddit ${styles.socialIcon}`}></i>
            </a>
            <a href="https://instagram.com" aria-label="Instagram">
                <i className={`fab fa-instagram ${styles.socialIcon}`}></i>
            </a>
            <a href="https://facebook.com" aria-label="Facebook">
                <i className={`fab fa-facebook ${styles.socialIcon}`}></i>
            </a>
            <a href="https://twitter.com" aria-label="Twitter">
                <i className={`fab fa-x-twitter ${styles.socialIcon}`}></i>
            </a>
            </div>

            <div className={styles.version}>v261</div>

        </div>
      </div>
              </div>

    </footer>
  );
};

export default Footer;
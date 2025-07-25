import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { selectCurrentUser, selectAuthStatus } from '../../features/auth/authSlice';
import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // const { isGuest, tokens } = useAppSelector(selectCurrentUser);
  // const authStatus = useAppSelector(selectAuthStatus);
  const dispatch = useAppDispatch();

  const isGuest = false;
  const authStatus = 'succeeded';
  const tokens = 3232;
  
  const handleLogoutClick = () => {
    dispatch(logout());
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">GameHub</Link>
      </div>
      
      <div className={styles.navLinks}>
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/lobby" className={styles.navLink}>Lobby</Link>
        <Link to="/leaderboard" className={styles.navLink}>Leaderboard</Link>
        <Link to="/store" className={styles.navLink}>Store</Link>
        <Link to="/catan" className={styles.navLink}>Catan</Link>

      </div>

      <div className={styles.authSection}>
        {authStatus === 'loading' && (
          <div className={styles.loadingIndicator}>Loading...</div>
        )}

        {authStatus === 'succeeded' ? (
          <div className={styles.userInfoContainer} ref={dropdownRef}>
            <div 
              className={styles.userInfo}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {!isGuest && (
                <span className={styles.tokenCount}>
                  <span className={styles.tokenIcon}>🪙</span> {tokens}
                </span>
              )}
              <span className={styles.userType}>
                {isGuest ? 'Guest' : 'Member'}
                <span className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.rotated : ''}`}>
                  ▼
                </span>
              </span>
            </div>
            
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {!isGuest && (
                  <>
                    <Link to="/profile" className={styles.dropdownItem}>
                      <i className="fas fa-user"></i> Profile
                    </Link>
                    <Link to="/settings" className={styles.dropdownItem}>
                      <i className="fas fa-cog"></i> Settings
                    </Link>
                    <Link to="/store" className={styles.dropdownItem}>
                      <i className="fas fa-coins"></i> Purchase Tokens
                    </Link>
                    <div className={styles.dropdownDivider}></div>
                  </>
                )}
                <button 
                  className={styles.dropdownItem}
                  onClick={handleLogoutClick}
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => {}} // Replace with your login handler
            className={styles.authButton}
            disabled={authStatus === 'loading'}
          >
            {authStatus === 'failed' ? 'Retry Login' : 'Login'}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
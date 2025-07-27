// features/auth/components/LoginForm/GuestLogin.tsx
import { useLoginAsGuestMutation } from '../../api/authApi';
import Button from '../../../../shared/ui/Button/Button';
import styles from './styles.module.css';

import { setCredentials } from '../../authSlice';
import { useDispatch } from 'react-redux';


interface GuestLoginProps {
  onLogin: () => void;
  onSwitchToCredentials: () => void;
  onSwitchToRegistration: () => void; // New prop
  onSwitchToSocial: () => void;
}

export function GuestLogin({ 
  onLogin, 
  onSwitchToCredentials,
  onSwitchToRegistration,
  onSwitchToSocial 
}: GuestLoginProps) {
  const [loginAsGuest, { isLoading }] = useLoginAsGuestMutation();
  const dispatch = useDispatch();

  const handleGuestLogin = async () => {
    try {
      const response = await loginAsGuest().unwrap();
      console.log('Guest login successful:', response);

      if (response.access_token && response.guest_id) {
        dispatch(
          setCredentials({
            token: response.access_token,
            isGuest: true,
            userId: response.guest_id,
          })
        );
      }
      onLogin();
    } catch (error) {
      console.error('Guest login failed:', error);
      // Consider adding error toast/notification
    }
  };

  return (
    <div className={styles.guestLogin}>
      <h2 className={styles.title}>Welcome!</h2>
      
      <Button 
        onClick={handleGuestLogin}
        className={styles.guestLoginButton}
        disabled={isLoading}
        // fullWidth
      >
        {isLoading ? 'Loading...' : 'Play as Guest'}
      </Button>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <div className={styles.loginOptions}>
        <button 
          onClick={onSwitchToCredentials}
          className={styles.textButton}
        >
          Sign in with Email
        </button>
        
        <button 
          onClick={onSwitchToRegistration}
          className={styles.textButton}
        >
          Create Account
        </button>
        
        <button 
          onClick={onSwitchToSocial}
          className={styles.textButton}
        >
          Continue with Social
        </button>
      </div>
    </div>
  );
}

export default GuestLogin;
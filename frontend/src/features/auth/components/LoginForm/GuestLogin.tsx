// features/auth/components/LoginForm/GuestLogin.tsx
import { useLoginAsGuestMutation } from '../../api/authApi';
import Button from '../../../../shared/ui/Button/Button';
import styles from './styles.module.css';

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

  const handleGuestLogin = async () => {
    try {
      await loginAsGuest().unwrap();
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
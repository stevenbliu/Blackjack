// features/auth/components/LoginForm/SocialLogin.tsx
import { useSocialLoginMutation } from '../../api/authApi';
import { Button } from '../../../../shared/ui/Button/Button';
// import Button from '../../../../shared/ui/Button/Button';
import SocialLoginButton from '../../../../components/SocialLoginButton'
import styles from './styles.module.css';

interface SocialLoginProps {
  onLogin: () => void;
  onSwitchToGuest: () => void;
  onSwitchToCredentials: () => void;
}

export default function SocialLogin({ 
  onLogin, 
  onSwitchToGuest, 
  onSwitchToCredentials 
}: SocialLoginProps) {
  const [socialLogin] = useSocialLoginMutation();

  const handleSocialLogin = async (provider: 'google' | 'discord') => {
    try {
      await socialLogin({provider}).unwrap();
      onLogin();
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    }
  };

  return (
    <div className={styles.socialLogin}>
      <div className={styles.socialButtons}>
        <SocialLoginButton 
          provider="google" 
          onClick={() => handleSocialLogin('google')}
        />
        <SocialLoginButton 
          provider="discord" 
          onClick={() => handleSocialLogin('discord')}
        />
      </div>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <div className={styles.socialFooter}>
        <Button 
          onClick={onSwitchToGuest}
          variant="text"
          className={styles.switchMode}
        >
          Back to Guest Login
        </Button>
        <Button 
          onClick={onSwitchToCredentials}
          variant="text"
          className={styles.switchMode}
        >
          Use Email/Password Instead
        </Button>
      </div>
    </div>
  );
}
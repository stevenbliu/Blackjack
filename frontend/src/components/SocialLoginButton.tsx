// components/SocialLoginButton/SocialLoginButton.tsx
import { FaGoogle, FaDiscord } from 'react-icons/fa';
import styles from './SocialLoginButton.module.css';

interface SocialLoginButtonProps {
  provider: 'google' | 'discord';
  onClick: () => void;
  disabled?: boolean;
}

export function SocialLoginButton({ 
  provider, 
  onClick, 
  disabled 
}: SocialLoginButtonProps) {
  const Icon = provider === 'google' ? FaGoogle : FaDiscord;
  const text = provider === 'google' ? 'Google' : 'Discord';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[provider]}`}
    >
      <Icon className={styles.icon} />
      Continue with {text}
    </button>
  );
}

export default SocialLoginButton
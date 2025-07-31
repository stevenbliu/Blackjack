// features/auth/components/LoginForm/LoginForm.tsx
import { AnimatePresence, motion } from 'framer-motion';
import GuestLogin from './GuestLogin';
import CredentialsForm from './CredentialsForm';
import SocialLogin from './SocialLogin';
import styles from './styles.module.css';

interface LoginFormProps {
  loginType: 'guest' | 'credentials' | 'social';
  setLoginType: (type: 'guest' | 'credentials' | 'social') => void;
  onSuccess: () => void;
}

export default function LoginForm({ loginType, setLoginType, onSuccess }: LoginFormProps) {
  return (
    <AnimatePresence mode="wait">
      {loginType === 'guest' && (
        <motion.div
          key="guest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <GuestLogin 
            onLogin={onSuccess}
            onSwitchToCredentials={() => setLoginType('credentials')}
            onSwitchToSocial={() => setLoginType('social')}
          />
        </motion.div>
      )}

      {loginType === 'credentials' && (
        <motion.div
          key="credentials"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <CredentialsForm 
            onLogin={onSuccess}
            onSwitchToGuest={() => setLoginType('guest')}
            onSwitchToSocial={() => setLoginType('social')}
          />
        </motion.div>
      )}

      {loginType === 'social' && (
        <motion.div
          key="social"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SocialLogin 
            onLogin={onSuccess}
            onSwitchToGuest={() => setLoginType('guest')}
            onSwitchToCredentials={() => setLoginType('credentials')}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// export default LoginForm;
// features/auth/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectAuthStatus } from './authSlice';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner/LoadingSpinner';
import LoginForm from './components/LoginForm/LoginForm';
import styles from './components/LoginForm/styles.module.css';

export function LoginPage() {
  const [loginType, setLoginType] = useState<'guest' | 'credentials' | 'social'>('guest');
  const navigate = useNavigate();
  const authStatus = useAppSelector(selectAuthStatus);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2>Welcome to Tabletop Arena</h2>
        
        {authStatus === 'loading' && <LoadingSpinner />}
        
        <LoginForm 
          loginType={loginType} 
          setLoginType={setLoginType}
          onSuccess={() => navigate('/')}
        />
      </div>
    </div>
  );
}

export default LoginPage;
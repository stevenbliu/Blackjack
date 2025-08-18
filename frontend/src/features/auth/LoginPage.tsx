// features/auth/LoginPage.tsx
import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectAuthStatus } from './authSlice';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner/LoadingSpinner';
const LoginForm = React.lazy(() => import('./components/LoginForm/LoginForm'));
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
        <Suspense fallback={<LoadingSpinner />}>
          <LoginForm 
            loginType={loginType} 
            setLoginType={setLoginType}
            onSuccess={() => navigate('/')}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default LoginPage;
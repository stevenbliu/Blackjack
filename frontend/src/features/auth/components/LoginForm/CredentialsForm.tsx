// features/auth/components/LoginForm/CredentialsForm.tsx
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLoginUserMutation } from '../../api/authApi';
import Button from '../../../../shared/ui/Button/Button';
import Input from '../../../../shared/ui/Input/Input';
import styles from './styles.module.css';

interface CredentialsFormProps {
  onLogin: () => void;
  onSwitchToGuest: () => void;
  onSwitchToSocial: () => void;
}

export function CredentialsForm({ 
  onLogin, 
  onSwitchToGuest, 
  onSwitchToSocial 
}: CredentialsFormProps) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginUser] = useLoginUserMutation();

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };
    
    if (!credentials.email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }
    
    if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await loginUser({ ...credentials, rememberMe }).unwrap();
      onLogin();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.credentialsForm}>
      <div className={styles.formGroup}>
        <Input
          label="Email"
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
          error={errors.email}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          error={errors.password}
          required
          icon={
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />
      </div>

      <div className={styles.formOptions}>
        <label className={styles.rememberMe}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>
        <a href="/forgot-password" className={styles.forgotPassword}>
          Forgot password?
        </a>
      </div>

      <Button 
        type="submit" 
        className={styles.submitButton}
      >
        Sign In
      </Button>

      <div className={styles.formFooter}>
        <button 
          type="button" 
          onClick={onSwitchToGuest}
          className={styles.switchMode}
        >
          Back to Guest Login
        </button>
        <button 
          type="button" 
          onClick={onSwitchToSocial}
          className={styles.switchMode}
        >
          Use Social Login Instead
        </button>
      </div>
    </form>
  );
}

export default CredentialsForm;
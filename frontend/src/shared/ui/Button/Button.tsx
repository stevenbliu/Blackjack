// src/shared/ui/Button/Button.tsx
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = styles[variant] || styles.primary;
  const sizeClass = styles[size] || styles.medium;
  const disabledClass = disabled || isLoading ? styles.disabled : '';
  
  return (
    <button
      className={`${styles.button} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className={styles.loadingSpinner} aria-hidden="true" />
          <span className={styles.srOnly}>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
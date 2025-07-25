// src/shared/ui/LoadingSpinner/LoadingSpinner.tsx
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'accent';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  speed = 'normal',
  className = ''
}: LoadingSpinnerProps) => {
  const sizeClass = styles[`size-${size}`];
  const colorClass = styles[`color-${color}`];
  const speedClass = styles[`speed-${speed}`];

  return (
    <div
      className={`${styles.spinner} ${sizeClass} ${colorClass} ${speedClass} ${className}`}
      aria-label="Loading"
      role="status"
    >
      <div className={styles.spinnerInner}></div>
    </div>
  );
};

export default LoadingSpinner;
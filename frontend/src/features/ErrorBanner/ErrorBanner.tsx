import React from 'react';
import styles from './ErrorBanner.module.css';

type ErrorBannerProps = {
  message: string;
  onClose: () => void;
};

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => (
  <div className={styles.errorBanner}>
    <span>{message}</span>
    <button onClick={onClose}>✖</button>
  </div>
);

export default ErrorBanner;

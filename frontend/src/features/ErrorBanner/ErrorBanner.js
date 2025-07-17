import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './ErrorBanner.module.css';
const ErrorBanner = ({ message, onClose }) => (_jsxs("div", { className: styles.errorBanner, children: [_jsx("span", { children: message }), _jsx("button", { onClick: onClose, children: "\u2716" })] }));
export default ErrorBanner;

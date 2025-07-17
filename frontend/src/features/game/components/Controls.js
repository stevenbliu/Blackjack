import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './Controls.module.css';
const Controls = ({ onHit, onStand, onRestart, disabled = false }) => {
    return (_jsxs("div", { className: styles.controls, children: [_jsx("button", { onClick: onHit, disabled: disabled, className: styles.controlButton, children: "Hit" }), _jsx("button", { onClick: onStand, disabled: disabled, className: styles.controlButton, children: "Stand" }), _jsx("button", { onClick: onRestart, className: styles.controlButton, children: "Restart" })] }));
};
export default Controls;

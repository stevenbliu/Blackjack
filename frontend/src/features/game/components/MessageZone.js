import { jsx as _jsx } from "react/jsx-runtime";
import styles from './MessageZone.module.css';
const MessageZone = ({ message }) => {
    if (!message)
        return null;
    return (_jsx("div", { className: styles.messageZone, role: "alert", "aria-live": "polite", children: message }));
};
export default MessageZone;

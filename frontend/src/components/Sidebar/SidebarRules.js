import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './SidebarRules.module.css';
const SidebarRules = ({ rulesVisible, setRulesVisible }) => {
    return (_jsxs("div", { className: styles.sidebar, children: [_jsx("button", { onClick: () => setRulesVisible(!rulesVisible), className: styles.toggleButton, children: rulesVisible ? 'Hide Rules' : 'Show Rules' }), rulesVisible && (_jsxs("div", { className: styles.rulesContainer, children: [_jsx("h3", { children: "Rules:" }), _jsxs("ul", { className: styles.rulesList, children: [_jsx("li", { children: "The dealer will draw (hit) cards until they reach 17 or higher." }), _jsx("li", { children: "You can hit to draw more cards or stand to end your turn." }), _jsx("li", { children: "If you go over 21, you bust and lose the game." }), _jsx("li", { children: "If the dealer busts, you win!" }), _jsx("li", { children: "If you and the dealer have the same score, it's a tie." })] })] }))] }));
};
export default SidebarRules;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Deck from '../Deck/Deck';
import styles from './WelcomeBox.module.css'; // Importing CSS modules for scoping
const WelcomeBox = () => (_jsxs("div", { className: styles.welcomeBox, children: [_jsx("h1", { children: " Blackjack" }), _jsx("h1", { children: " \uD83C\uDCCF " }), _jsx("p", { children: "Try to beat the dealer by getting as close to 21 as possible without going over." }), _jsx(Deck, {})] }));
export default WelcomeBox;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const isLoggingEnabled = process.env.NODE_ENV === 'development';
const log = (...args) => {
    if (isLoggingEnabled) {
        console.log(...args);
    }
};
const RoomList = ({ games, onJoin }) => {
    log('Rendering RoomList with games:', games);
    return (_jsx("ul", { style: { listStyle: 'none', padding: 0 }, children: games.map((game) => {
            // log('Rendering game:', game.id);
            return (_jsxs("li", { style: {
                    marginBottom: '8px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }, onClick: () => {
                    log('Joining game:', game.game_id);
                    onJoin(game.game_id);
                }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Game ID:" }), " ", game.game_id, _jsx("br", {}), "Players: ", game.players.length, " / ", game.max_players] }), _jsx("button", { onClick: (e) => {
                            e.stopPropagation();
                            log('Button clicked, joining game:', game.game_id);
                            onJoin(game.game_id);
                        }, children: "Join" })] }, game.game_id));
        }) }));
};
export default RoomList;

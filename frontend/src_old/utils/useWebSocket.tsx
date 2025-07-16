// import { useEffect, useRef } from 'react';

// export const useWebSocket = (
//   gameId: string | null, 
//   playerId: string, 
//   onLobbyUpdate: (lobbyData: any) => void,
//   onGameUpdate: (gameData: any) => void
// ) => {
//   const wsRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
//     const wsHost = window.location.hostname + ':8000';
//     const wsUrl = `${wsScheme}://${wsHost}/ws?gameId=${gameId}&playerId=${playerId}`;
//     const ws = new WebSocket(wsUrl);

//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log("WebSocket opened.");
//     };

//     ws.onmessage = (event) => {
//       console.log("WebSocket message received:", event.data);
//       const data = JSON.parse(event.data);
//       if (data.lobby && onLobbyUpdate) {
//         // Only call onLobbyUpdate if lobby data is received
//         onLobbyUpdate(data.lobby);
//       }
//       if (data.game && onGameUpdate) {
//         // Only call onGameUpdate if game data is received
//         onGameUpdate(data.game);
//       }
//     };

//     ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//       // ws.close(); // Close the WebSocket on error
//     };

//     ws.onclose = () => {
//       console.log("WebSocket closed.");
//     };

//     // Cleanup WebSocket connection on component unmount
//     return () => {
//       ws.close();
//     };
//   }, [gameId, playerId, onLobbyUpdate, onGameUpdate]);

//   return wsRef.current; // You can return the WebSocket object if needed
// };

import logging
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, player_id: str):
        await websocket.accept()
        self.active_connections[player_id] = websocket
        logging.info(f"{player_id} connected.")

    def disconnect(self, player_id: str):
        if player_id in self.active_connections:
            del self.active_connections[player_id]
            logging.info(f"{player_id} disconnected.")

    async def send_message(self, player_id: str, message: str):
        websocket = self.active_connections.get(player_id)
        if websocket:
            try:
                await websocket.send_text(message)
            except RuntimeError as e:
                logging.error(f"Failed to send message to {player_id}: {e}")
                self.disconnect(player_id)

    async def broadcast(self, message: str):
        disconnected = []
        for player_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(message)
            except RuntimeError as e:
                logging.error(f"Failed to send broadcast to {player_id}: {e}")
                disconnected.append(player_id)
        for pid in disconnected:
            self.disconnect(pid)

import logging
from datetime import datetime
from typing import Dict, Any
from socketio import AsyncNamespace

logger = logging.getLogger(__name__)


class GameNamespace(AsyncNamespace):
    """Refactored Game Namespace with enhanced room management"""

    def __init__(self, namespace: str, session_manager, connection_manager):
        super().__init__(namespace)
        self.sm = session_manager
        self.cm = connection_manager
        self.game_states: Dict[str, Dict] = {}

    async def on_connect(self, sid, environ):
        """Handle game namespace connection"""
        session = await self.sm.get_session(sid)
        if not session:
            raise ConnectionRefusedError("Unauthorized")

        logger.info(f"Game connected: {sid} (user: {session['user_id']})")

    async def on_disconnect(self, sid):
        """Handle game namespace disconnection"""
        logger.info(f"Game disconnected: {sid}")

    async def on_join_game(self, sid, data):
        """Handle joining a game room"""
        session = await self.sm.get_session(sid)
        if not session:
            return await self._emit_error(sid, "Unauthorized")

        game_id = data["game_id"]
        room_id = f"game_{game_id}"

        # Join game room
        success = await self.cm.join_room(sid, room_id, namespace=self.namespace)

        if success:
            # Initialize game state if new room
            if room_id not in self.game_states:
                self.game_states[room_id] = {
                    "players": [],
                    "state": "waiting",
                    "created_at": datetime.now().isoformat(),
                }

            # Add player to game
            self.game_states[room_id]["players"].append(session["user_id"])

            await self.emit(
                "game_joined",
                {"game_id": game_id, "players": self.game_states[room_id]["players"]},
                room=sid,
            )

            # Notify other players
            await self.cm.send_to_room(
                room_id,
                "player_joined",
                {"player_id": session["user_id"]},
                namespace=self.namespace,
                skip_sid=sid,
            )
        else:
            await self._emit_error(sid, "Failed to join game")

    async def on_game_action(self, sid, data):
        """Handle game actions"""
        session = await self.sm.get_session(sid)
        if not session:
            return await self._emit_error(sid, "Unauthorized")

        game_id = data["game_id"]
        room_id = f"game_{game_id}"

        if room_id not in self.cm.get_user_rooms(sid):
            return await self._emit_error(sid, "Not in game")

        # Validate game action
        if not self._validate_action(data["action"]):
            return await self._emit_error(sid, "Invalid action")

        # Broadcast action to all players
        await self.cm.send_to_room(
            room_id,
            "game_update",
            {
                "player_id": session["user_id"],
                "action": data["action"],
                "timestamp": datetime.now().isoformat(),
            },
            namespace=self.namespace,
        )

    # Helper methods
    def _validate_action(self, action: Dict[str, Any]) -> bool:
        """Validate game action"""
        # Implement your game-specific validation logic
        return True

    async def _emit_error(self, sid: str, message: str):
        """Send error message to client"""
        await self.emit("error", {"message": message}, room=sid)

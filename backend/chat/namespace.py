import logging
from datetime import datetime
from typing import Dict, Any
from socketio import AsyncNamespace
import asyncio
from MockManagers import MockSessionManager, MockConnectionManager
from chat.service import chat_rooms

logger = logging.getLogger(__name__)


class ChatNamespace(AsyncNamespace):
    def __init__(
        self,
        namespace: str,
        session_manager: MockSessionManager,
        connection_manager: MockConnectionManager,
    ):
        super().__init__(namespace)
        self.sm = session_manager
        self.cm = connection_manager
        self.message_history: Dict[str, list] = {}
        self._history_lock = asyncio.Lock()
        self._max_history_per_room = 1000

    async def on_connect(self, sid, environ, auth):
        if not auth or "token" not in auth or "username" not in auth:
            raise ConnectionRefusedError(
                f"Missing token or username: Auth contains:{auth}"
            )

        logging.info(f"User connected: sid={sid} Auth: {auth}")
        # Get
        token = auth["token"]
        username = auth["username"]
        user_id = auth["user_id"]
        # Store session with sid as user_id and username from client
        await self.sm.create_session(sid, token)
        self.sm.sessions[sid]["user_sid"] = sid  # user_id = sid
        self.sm.sessions[sid]["username"] = username  # username = client id
        self.sm.sessions[sid]["user_id"] = user_id

        logging.info(f"User connected: sid={sid}, username={username}")

    async def on_disconnect(self, sid):
        logger.info(f"[CHAT NAMESPACE] DISCONNECT - SID: {sid}")

    async def on_join_room(self, sid, data):
        logger.info(f"[CHAT NAMESPACE] JOIN ROOM - SID: {sid}")
        session = await self.sm.get_session(sid)
        if not session:
            await self._emit_error(sid, "Unauthorized")
            return

        room_id = f"chat_{data['room_id']}"  # Prefix rooms as you like

        if data["room_id"] not in chat_rooms:
            await self._emit_error(
                sid,
                f"Room '{data['room_id']}' does not exist. Current rooms: {chat_rooms}",
            )
            return

        success = await self.cm.join_room(sid, room_id, namespace=self.namespace)
        if success:
            logger.info(f"SID {sid} joined room {room_id}")
            # Notify only this client that they joined
            await self.emit("room_joined", {"room_id": data["room_id"]}, room=sid)
            await self._send_room_history(sid, room_id)
        else:
            await self._emit_error(sid, "Failed to join room")

    async def on_message(self, sid, data):
        logger.info(f"[CHAT NAMESPACE] MESSAGE from SID {sid}: {data}")

        session = await self.sm.get_session(sid)
        if not session:
            await self._emit_error(sid, "Unauthorized")
            return

        room_id = f"chat_{data['room_id']}"
        if room_id not in self.cm.get_user_rooms(sid):
            await self._emit_error(sid, "Not in room")
            return

        message = {
            "user_id": session["user_id"],
            "username": session.get("username", ""),
            "message": data["message"],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "room_id": room_id,
            # "room_name": chat_rooms[room_id],
        }

        self._store_message(room_id, message)

        # Broadcast to all clients in the room, including sender
        await self.cm.send_to_room(
            event="new_message", data=message, namespace=self.namespace, room_id=room_id
        )

    # Helpers

    async def _send_room_history(self, sid: str, room_id: str, limit: int = 50):
        history = self.message_history.get(room_id, [])[-limit:]
        await self.emit(
            "room_history", {"room_id": room_id, "messages": history}, room=sid
        )

    def _store_message(self, room_id: str, message: Dict[str, Any]):
        if room_id not in self.message_history:
            self.message_history[room_id] = []
        self.message_history[room_id].append(message)
        # Optionally trim history to _max_history_per_room
        if len(self.message_history[room_id]) > self._max_history_per_room:
            self.message_history[room_id] = self.message_history[room_id][
                -self._max_history_per_room :
            ]

    async def _emit_error(self, sid: str, message: str):
        await self.emit("error", {"message": message}, room=sid)

    async def on_test(self, sid, data):
        logger.info(f"[CHAT NAMESPACE] test message from SID {sid}: {data}")

        session = await self.sm.get_session(sid)
        if not session:
            await self._emit_error(sid, "Unauthorized")
            return

        if "room_id" in data:
            room_id = f"chat_{data['room_id']}"
            if room_id not in self.cm.get_user_rooms(sid):
                await self._emit_error(sid, "Not in room")
                return

        message = {
            "user_id": session["user_id"],
            "username": session.get("username", ""),
            "text": data["message"],
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

        # self._store_message(room_id, message)

        # Broadcast to all clients in the room, including sender
        if "room_id" in data:
            await self.cm.send_to_room(
                event="test", data=message, namespace=self.namespace, room_id=room_id
            )
        else:
            await self.cm.send_to_room(
                event="test", data=message, namespace=self.namespace
            )

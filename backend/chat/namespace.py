import logging
from datetime import datetime
from typing import Dict, Any
from socketio import AsyncNamespace
import asyncio

from MockManagers import MockSessionManager, MockConnectionManager
from chat.service import chat_rooms
from chat.decorators import validate_payload
from chat.modelsSocket import *

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
        logging.info(f"[CHAT NAMEPSACE] CONNECT: sid={sid}, auth={auth}")

        # if not auth or "token" not in auth or "username" not in auth:
        #     logging.info("[CHAT] No Auth provided")
        #     raise ConnectionRefusedError(
        #         f"Missing token or username: Auth contains:{auth}"
        #     )
        #     return False

        # Get
        token = auth["token"]
        username = auth["username"]
        user_id = auth["user_id"]
        # Store session with sid as user_id and username from client
        await self.sm.create_session(sid, token)
        self.sm.sessions[sid]["user_sid"] = sid  # user_id = sid
        self.sm.sessions[sid]["username"] = username  # username = client id
        self.sm.sessions[sid]["user_id"] = user_id
        logging.info("[CHAT] Successully connected ")
        return True

    async def on_disconnect(self, sid):
        """Handle client disconnection from /chat namespace"""
        logging.info(f"[CHAT NAMEPSACE] DISCONNECT: sid={sid}")

        try:
            # Get session data before cleanup
            session = await self.get_session(sid)
            user_id = session.get("user_id")
            username = session.get("username")

            logger.info(
                f"[CHAT NS] Disconnect - SID: {sid} | " f"User: {username} ({user_id})"
            )

            # 1. Remove from connection manager
            await self.cm.remove_connection(sid)

            # 2. Clean up session
            await self.sm.delete_session(sid)

            # 3. Notify other users (optional)
            await self.emit(
                "user_left",
                {
                    "user_id": user_id,
                    "username": username,
                    "timestamp": datetime.now().isoformat(),
                },
                skip_sid=sid,
            )

        except KeyError as e:
            logger.error(f"[CHAT NS] Missing session data for {sid}: {str(e)}")
        except Exception as e:
            logger.error(
                f"[CHAT NS] Disconnect error for {sid}: {str(e)}", exc_info=True
            )
        finally:
            # Ensure socket is properly closed
            try:
                await self.disconnect(sid)
            except:
                pass

    @validate_payload(JoinRoomPayload)
    async def on_join_room(self, sid, data: JoinRoomPayload):
        logger.info(f"[CHAT NAMESPACE] JOIN ROOM - SID: {sid} data: {data}")
        session = await self.sm.get_session(sid)
        if not session:
            await self._emit_error(sid, "Unauthorized")
            return {
                "success": False,
                "namespace": self.namespace,
                "error": "Unauthorized, session not found",
            }

        if "chat_" not in data.room_id:
            room_id = f"chat_{data.room_id}"
        else:
            room_id = data.room_id

        if room_id not in chat_rooms:
            await self._emit_error(
                sid,
                f"Room '{room_id}' does not exist. Current rooms: {chat_rooms}",
            )
            return {
                "success": False,
                "namespace": self.namespace,
                "error": " Room does not exist",
            }

        success = await self.cm.join_room(sid, room_id, namespace=self.namespace)
        if success:
            logger.info(f"SID {sid} joined room {room_id}")
            # Notify only this client that they joined
            await self.emit("room_joined", {"room_id": room_id}, room=sid)
            await self._send_room_history(sid, room_id)
            return {"success": True, "namespace": self.namespace, "error": None}
        else:
            await self._emit_error(sid, "Failed to join room")
            return {
                "success": False,
                "namespace": self.namespace,
                "error": "Failed to join room",
            }

    @validate_payload(MessagePayload)
    async def on_message(self, sid, data: MessagePayload, *args):
        logger.info(
            f"[CHAT NAMESPACE] MESSAGE from SID: {sid} data: {data}, args: {args}"
        )

        session = await self.sm.get_session(sid)
        if not session:
            logging.info(f"SID {sid} not found)")
            await self._emit_error(sid, "Session not found")
            return {
                "success": False,
                "namespace": self.namespace,
                "error": "Session not found",
                "from": "chat message",
            }

        if "chat_" not in data.room_id:
            room_id = f"chat_{data.room_id}"
        else:
            room_id = data.room_id

        if room_id not in self.cm.get_user_rooms(sid):
            logging.info(f"SID {sid} not in room {room_id}")
            await self._emit_error(sid, "Not in room")
            return {
                "success": False,
                "namespace": self.namespace,
                "error": "Not in room",
            }

        message = {
            "user_id": session["user_id"],
            "username": session.get("username", ""),
            "message": data.message,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "room_id": room_id,
            # "room_name": chat_rooms[room_id],
        }

        self._store_message(room_id, message)

        # Broadcast to all clients in the room, including sender
        await self.cm.send_to_room(
            event="new_message", data=message, namespace=self.namespace, room_id=room_id
        )

        return {
            "success": True,
            "namespace": self.namespace,
            "from": "chat message",
            "error": None,
        }

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
            room_id = f"chat_{data.room_id}"
            if room_id not in self.cm.get_user_rooms(sid):
                await self._emit_error(sid, "Not in room")
                return

        message = {
            "user_id": session["user_id"],
            "username": session.get("username", ""),
            "text": data.message,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "from": "test",
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

    async def trigger_event(self, event, *args):
        logger.info(f"[ALL CHAT TRIGGER] Event: {event}, args: {len(args)}")

        # for idx, arg in enumerate(args):
        #     logger.info(f"[ALL CHAT TRIGGER] Argument {idx}: {arg}")

        # Dynamically look for a method named on_<event>
        method_name = f"on_{event}"
        handler = getattr(self, method_name, None)

        if callable(handler):
            logger.info(f"[ALL CHAT TRIGGER] Found handler for event '{event}'")

            return await super().trigger_event(event, *args)

        else:
            logger.info(f"[ALL CHAT TRIGGER] Handler not found for event '{event}'")

            return {
                "success": False,
                "error": f"No handler for event: {event}",
                "timestamp": datetime.now().isoformat(),
                "from": "chat trigger",
            }

        #     return await handler(*args)
        # else:
        #     logger.warning(f"No handler for event '{event}'")
        #     return {
        #         "success": False,
        #         "error": f"Unknown event: {event}",
        #         "timestamp": datetime.now().isoformat(),
        #     }

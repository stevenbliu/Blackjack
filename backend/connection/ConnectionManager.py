import logging
from typing import Dict, Set, Optional, List
from datetime import datetime, timedelta
import asyncio
from dataclasses import dataclass, field
from collections import defaultdict

logger = logging.getLogger(__name__)


@dataclass
class UserSession:
    """Represents a user session with their connection details"""

    sid: str
    user_id: str
    username: Optional[str] = None
    is_guest: bool = False
    connected_at: datetime = field(default_factory=datetime.now)
    last_seen: datetime = field(default_factory=datetime.now)
    rooms: Set[str] = field(default_factory=set)
    metadata: Dict = field(default_factory=dict)

    def to_dict(self):
        return {
            "sid": self.sid,
            "user_id": self.user_id,
            "username": self.username,
            "is_guest": self.is_guest,
            "connected_at": self.connected_at.isoformat(),
            "last_seen": self.last_seen.isoformat(),
            "rooms": list(self.rooms),
            "metadata": self.metadata,
        }


class ConnectionManager:
    """Manages Socket.IO connections, rooms, and user sessions"""

    def __init__(self, sio_server):
        self.sio = sio_server
        self._user_to_sids = defaultdict(set)  # user_id → set of SIDs

        # Core data structures
        self._sessions: Dict[str, UserSession] = {}  # sid -> UserSession
        self._user_sessions: Dict[str, Set[str]] = defaultdict(
            set
        )  # user_id -> set of sids
        self._rooms: Dict[str, Set[str]] = defaultdict(set)  # room_id -> set of sids
        self._room_metadata: Dict[str, Dict] = {}  # room_id -> metadata
        self._namespace_rooms: Dict[str, Dict[str, Set[str]]] = defaultdict(
            lambda: defaultdict(set)
        )  # namespace -> room_id -> set of sids

        # Stats tracking
        self._connection_count = 0
        self._message_count = 0

        logger.info("ConnectionManager initialized")

    async def add_connection(
        self,
        sid: str,
        user_id: str,
        is_guest: bool = False,
        username: Optional[str] = None,
        metadata: Dict = None,
    ):
        """Add a new connection to the manager"""
        self._user_to_sids[user_id].add(sid)

        session = UserSession(
            sid=sid,
            user_id=user_id,
            username=username,
            is_guest=is_guest,
            metadata=metadata or {},
        )
        self._sessions[sid] = session
        self._user_sessions[user_id].add(sid)
        self._connection_count += 1
        await self._emit_user_status(user_id, "online")

    async def remove_connection(self, sid: str):
        """Remove a connection from the manager"""
        if sid not in self._sessions:
            return

        session = self._sessions[sid]
        user_id = session.user_id

        # Remove from all rooms
        for room_id in list(session.rooms):
            await self.leave_room(sid, room_id)

        # Clean up session data
        del self._sessions[sid]
        self._user_sessions[user_id].discard(sid)

        if not self._user_sessions[user_id]:
            del self._user_sessions[user_id]
            await self._emit_user_status(user_id, "offline")

        self._connection_count -= 1

    async def join_room(
        self, sid: str, room_id: str, namespace: str = "/", room_metadata: Dict = None
    ):
        """Add a user to a room with namespace support"""
        if sid not in self._sessions:
            logger.error(f"Cannot join room: session {sid} not found")
            return False

        # Validate room prefix based on namespace
        if namespace == "/chat" and not room_id.startswith("chat_"):
            room_id = f"chat_{room_id}"
        elif namespace == "/game" and not room_id.startswith("game_"):
            room_id = f"game_{room_id}"

        session = self._sessions[sid]
        await self.sio.enter_room(sid, room_id, namespace=namespace)

        self._rooms[room_id].add(sid)
        self._namespace_rooms[namespace][room_id].add(sid)
        session.rooms.add(room_id)

        if room_metadata:
            self._room_metadata[room_id] = room_metadata

        return True

    async def leave_room(self, sid: str, room_id: str, namespace: str = "/"):
        """Remove a user from a room with namespace support"""
        if sid not in self._sessions:
            return False

        session = self._sessions[sid]
        await self.sio.leave_room(sid, room_id, namespace=namespace)

        self._rooms[room_id].discard(sid)
        self._namespace_rooms[namespace][room_id].discard(sid)
        session.rooms.discard(room_id)

        if not self._rooms[room_id]:
            del self._rooms[room_id]
            if room_id in self._room_metadata:
                del self._room_metadata[room_id]

        return True

    async def send_to_user(self, user_id: str, event: str, data: dict):
        """Send message to all sessions of a specific user"""

        if user_id not in self._user_sessions:
            logger.warning(f"User {user_id} not found for message")
            return False

        sent_count = 0
        for sid in list(
            self._user_sessions[user_id]
        ):  # Create copy to avoid modification during iteration
            try:
                await self.sio.emit(event, data, room=sid)
                sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send message to {sid}: {e}")
                # Don't remove session here - let disconnect handler deal with it

        logger.debug(f"Sent {event} to {sent_count} sessions for user {user_id}")
        return sent_count > 0

    async def send_to_room(
        self,
        room_id: str,
        event: str,
        data: dict,
        namespace: str = "/",
        skip_sid: Optional[str] = None,
    ):
        """Send message to a room in specific namespace"""
        if room_id not in self._namespace_rooms.get(namespace, {}):
            logger.warning(f"Room {room_id} not found in namespace {namespace}")
            return False

        try:
            await self.sio.emit(
                event, data, room=room_id, namespace=namespace, skip_sid=skip_sid
            )
            self._message_count += 1
            return True
        except Exception as e:
            logger.error(f"Failed to send to room {room_id}: {e}")
            return False

    async def broadcast_to_all(
        self, event: str, data: dict, skip_sid: Optional[str] = None
    ):
        """Broadcast message to all connected users"""

        try:
            await self.sio.emit(event, data, skip_sid=skip_sid)
            self._message_count += 1
            logger.debug(f"Broadcast {event} to all users (skipped {skip_sid})")
            return True
        except Exception as e:
            logger.error(f"Failed to broadcast to all: {e}")
            return False

    async def update_user_activity(self, sid: str):
        """Update last seen timestamp for a user"""

        if sid in self._sessions:
            self._sessions[sid].last_seen = datetime.now()

    async def _emit_user_status(self, user_id: str, status: str):
        """Emit user online/offline status to interested parties"""

        # You can customize this to only notify users in same rooms, friends, etc.
        status_data = {
            "user_id": user_id,
            "status": status,
            "timestamp": datetime.now().isoformat(),
        }

        # For now, broadcast to all - you might want to be more selective
        await self.broadcast_to_all("user_status_changed", status_data)

    # Query methods

    def get_session(self, sid: str) -> Optional[UserSession]:
        """Get session by socket ID"""
        return self._sessions.get(sid)

    def get_user_sessions(self, user_id: str) -> List[UserSession]:
        """Get all sessions for a user"""
        if user_id not in self._user_sessions:
            return []
        return [
            self._sessions[sid]
            for sid in self._user_sessions[user_id]
            if sid in self._sessions
        ]

    def is_user_online(self, user_id: str) -> bool:
        """Check if user has any active sessions"""
        return user_id in self._user_sessions and len(self._user_sessions[user_id]) > 0

    def get_room_users(self, room_id: str) -> List[UserSession]:
        """Get all users in a room"""
        if room_id not in self._rooms:
            return []
        return [
            self._sessions[sid] for sid in self._rooms[room_id] if sid in self._sessions
        ]

    def get_sids_for_user(self, user_id):
        return self._user_to_sids.get(user_id, set())

    def get_user_rooms(self, sid: str) -> Set[str]:
        """Get all rooms a user is in"""
        session = self.get_session(sid)
        return session.rooms if session else set()

    def get_stats(self) -> Dict:
        """Get connection manager statistics"""
        return {
            "total_connections": self._connection_count,
            "unique_users": len(self._user_sessions),
            "active_rooms": len(self._rooms),
            "total_messages": self._message_count,
            "rooms_info": {
                room_id: {
                    "user_count": len(sids),
                    "users": [
                        self._sessions[sid].username or self._sessions[sid].user_id
                        for sid in sids
                        if sid in self._sessions
                    ],
                }
                for room_id, sids in self._rooms.items()
            },
        }

    async def cleanup_stale_connections(self, max_age_minutes: int = 30):
        """Clean up connections that haven't been active recently"""

        cutoff_time = datetime.now() - timedelta(minutes=max_age_minutes)
        stale_sids = []

        for sid, session in self._sessions.items():
            if session.last_seen < cutoff_time:
                stale_sids.append(sid)

        for sid in stale_sids:
            logger.info(f"Cleaning up stale connection {sid}")
            await self.remove_connection(sid)

        return len(stale_sids)

    def get_rooms_in_namespace(self, namespace: str) -> Dict[str, Set[str]]:
        """Get all rooms and their users in a specific namespace"""
        return dict(self._namespace_rooms.get(namespace, {}))

    def get_users_in_namespace_room(
        self, namespace: str, room_id: str
    ) -> List[UserSession]:
        """Get all users in a specific room within a namespace"""
        if (
            namespace not in self._namespace_rooms
            or room_id not in self._namespace_rooms[namespace]
        ):
            return []
        return [
            self._sessions[sid]
            for sid in self._namespace_rooms[namespace][room_id]
            if sid in self._sessions
        ]

    def get_connections(self) -> Dict[str, Dict]:
        """Get all active connections with their data"""
        return {
            sid: {
                "user_id": session.user_id,
                "username": session.username,
                "rooms": list(session.rooms),
            }
            for sid, session in self._sessions.items()
        }


# Global connection manager instance (will be initialized in main.py)
connection_manager: Optional[ConnectionManager] = None


def init_connection_manager(sio_server) -> ConnectionManager:
    """Initialize the global connection manager"""
    global connection_manager
    connection_manager = ConnectionManager(sio_server)
    return connection_manager


def get_connection_manager() -> ConnectionManager:
    """Get the global connection manager instance"""
    if connection_manager is None:
        raise RuntimeError(
            "Connection manager not initialized. Call init_connection_manager first."
        )
    return connection_manager

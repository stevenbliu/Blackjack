from jose import jwt
from typing import Optional, Dict
import logging
from socketio import AsyncServer  # Add this import


class SessionManager:
    def __init__(self, secret_key: str, sio_server: Optional[AsyncServer] = None):
        self.secret_key = secret_key
        self._sessions: Dict[str, Dict] = {}  # sid -> {user_id, username, ...}
        self.server = sio_server  # Store the Socket.IO server instance

    async def create_session(self, sid: str, token: str) -> Dict:
        """Create session in both session manager and socket.io"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            session_data = {
                "user_id": payload["sub"],
                "username": payload.get("username"),
                "authenticated": True,
                "is_guest": payload.get("is_guest", False),
                "token": token,
            }

            # Save to local store
            self._sessions[sid] = session_data

            # Save to socket.io if server is available
            if self.server:
                await self.server.save_session(sid, session_data)
            else:
                logging.warning(
                    "Socket.IO server instance not available - session not saved to socket.io"
                )

            return session_data
        except Exception as e:
            logging.error(f"Session creation failed: {str(e)}", exc_info=True)
            raise ConnectionRefusedError("Invalid token")

    async def get_session(self, sid: str) -> Optional[Dict]:
        """Retrieve session data."""
        return self._sessions.get(sid)

    async def delete_session(self, sid: str):
        """Remove session on disconnect."""
        self._sessions.pop(sid, None)

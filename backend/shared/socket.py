import socketio
from auth.service import verify_token

# Initialize Socket.IO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*", logger=True)


# Authentication middleware
@sio.event
async def connect(sid, environ):
    token = environ.get("HTTP_AUTHORIZATION", "").replace("Bearer ", "")
    if not verify_token(token):
        raise ConnectionRefusedError("Authentication failed")
    await sio.save_session(sid, {"token": token})


# Chat Namespace
class ChatNamespace(socketio.AsyncNamespace):
    async def on_message(self, sid, data):
        """Handle chat messages"""
        session = await self.get_session(sid)
        await self.emit(
            "new_message", {"user": session["user_id"], "text": data["text"]}
        )


# Game Namespace
class GameNamespace(socketio.AsyncNamespace):
    async def on_move(self, sid, data):
        """Handle game moves"""
        session = await self.get_session(sid)
        await self.emit(
            "game_update",
            {"move": data["move"], "player": session["user_id"]},
            room=data["game_id"],
        )


# Register namespaces
sio.register_namespace(ChatNamespace("/chat"))
sio.register_namespace(GameNamespace("/game"))

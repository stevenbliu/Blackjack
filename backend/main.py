import socketio
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import Mount  # Add this import
import jwt
from jwt import ExpiredSignatureError

from auth.routes import router as auth_router
from game.routes import router as game_router
from chat.routes import router as chat_router

import sys

import uvicorn
from urllib.parse import parse_qs  # For query string parsing
from auth.service import verify_token

# Import managers and namespaces
from connection.ConnectionManager import ConnectionManager, init_connection_manager
from session.SessionManager import SessionManager
from chat.namespace import ChatNamespace
from game.namespace import GameNamespace

import datetime
from collections import defaultdict
import logging
import asyncio

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),  # Force output to stdout
    ],
    force=True,  # This overrides any existing config
)

# Set specific loggings to INFO level
logging.getLogger("chat.chat_namespace").setLevel(logging.INFO)
logging.getLogger("chat.connection_manager").setLevel(logging.INFO)
logging.getLogger(__name__).setLevel(logging.INFO)

# Initialize Socket.IO server FIRST
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    engineio_logging=True,  # Enable for debugging
)


app = FastAPI()

# CORS Middleware - Must come before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# HTTP Routes
app.include_router(auth_router)  # Remove prefix since it's already in routes.py
app.include_router(game_router)
app.include_router(chat_router)

SECRET_KEY = "your-secret-key"  # Use env var in production
ALGORITHM = "HS256"  # HMAC-SHA256 - common algorithm for JWT


# Initialize Managers
# session_manager = SessionManager(secret_key=SECRET_KEY, sio_server=sio)
# connection_manager = ConnectionManager(sio)

from MockManagers import MockSessionManager, MockConnectionManager

session_manager = MockSessionManager()
connection_manager = MockConnectionManager(sio)


# Initialize namespaces
chat_namespace = ChatNamespace(
    namespace="/chat",
    session_manager=session_manager,
    connection_manager=connection_manager,
)

game_namespace = GameNamespace(
    namespace="/game",
    session_manager=session_manager,
    connection_manager=connection_manager,
)


# Root namespace connection handler
@sio.event
async def connect(sid, environ, auth=None):
    """Root namespace connection handler supporting multiple auth sources."""
    logging.info("ws connection")
    try:
        logging.info(f"Root WS Connection SID: {sid}, auth={auth}")

        token = None
        username = None
        user_id = None

        # 1. Preferred: from auth param
        if auth and isinstance(auth, dict):
            token = auth.get("token")
            username = auth.get("username")
            user_id = auth.get("user_id")
            logging.info(
                f"Auth from handshake: token={token}, username={username}, user_id={user_id}"
            )

        # 2. Fallback: query string
        if not token and environ.get("QUERY_STRING"):
            params = parse_qs(environ["QUERY_STRING"])
            token = params.get("token", [None])[0]
            username = params.get("username", [None])[0]
            user_id = params.get("user_id", [None])[0]
            logging.info(
                f"Auth from query string: token={token}, username={username}, user_id={user_id}"
            )

        # 3. Fallback: HTTP headers
        if not token and environ.get("headers"):
            headers = (
                dict(environ["headers"])
                if isinstance(environ["headers"], list)
                else environ["headers"]
            )
            auth_header = headers.get("authorization") or headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:]
                logging.info(f"Token from headers for {sid}")

        if not token or not username or not user_id:
            logging.warning(
                f"Missing auth fields. Token: {token}, Username: {username}, User ID: {user_id}"
            )
            raise ConnectionRefusedError("Missing or incomplete auth parameters")

        # Optional: verify token (uncomment to enable JWT checks)
        # payload = verify_token(token)
        # user_id = payload["sub"]
        # username = payload.get("username")

        session_data = {
            "user_id": user_id,
            "username": username,
            "authenticated": True,
            "__main__": True,
            "token": token,
        }

        # Save session and initialize connection tracking
        await asyncio.gather(
            sio.save_session(sid, session_data),
            session_manager.create_session(sid, token),
            connection_manager.add_connection(sid=sid),  # You can include user_id etc.
        )

        logging.info(
            f"✅ Root connect successful: sid={sid}, user_id={user_id}, username={username}"
        )

        await sio.emit("root_test", {"data": "Connected", "sid": sid}, to=sid)
        return True

    except ExpiredSignatureError:
        logging.error(f"❌ Expired token for sid={sid}")
        raise ConnectionRefusedError("Token expired")
    except Exception as e:
        logging.error(f"❌ Connection error for sid={sid}: {e}")
        raise ConnectionRefusedError("Authentication failed")


@sio.event
async def disconnect(sid):
    """Handle disconnection"""
    try:
        await session_manager.delete_session(sid)
        await connection_manager.remove_connection(sid)
        logging.info(f"Client disconnected: {sid}")
    except Exception as e:
        logging.error(f"Error during disconnect for {sid}: {str(e)}")


# @sio.event
# async def chat_message(sid, data):
#     logging.info(f"Received message from {sid}: {data}")
#     # You can now handle or broadcast the message
#     await sio.emit("chat_message", data, room=sid)  # echo back or broadcast

subscriptions = defaultdict(set)  # event_name: set of sids


@sio.on("subscribe")
async def subscribe(event, sid, payload):
    logging.info(
        f"Received [ALL EVENTS] Event: {event}, SID: {sid}, payload: {payload}"
    )
    # event = data['event']
    subscriptions[event].add(sid)

    await sio.emit(
        "subscription:ack",
        {"event": event, "status": "success", "timestamp": datetime.now().isoformat()},
        to=sid,
    )


@sio.on("*")
async def catch_all(event, sid, payload):
    logging.info(
        f"Received [ALL EVENTS] Event: {event}, SID: {sid}, payload: {payload}"
    )
    await sio.emit(event, {payload: "Connected", sid: sid}, to=sid)


# HTTP endpoints
@app.get("/")
async def root():
    return {"status": "API is running"}


@app.get("/healthcheck")
async def healthcheck():
    return Response(status_code=200)


@app.get("/connections/stats")
async def get_connection_stats():
    """Get connection statistics"""
    return connection_manager.get_stats()


# sio.register_namespace(game_namespace)


# Initialize namespaces
chat_namespace = ChatNamespace(
    namespace="/chat",
    session_manager=session_manager,
    connection_manager=connection_manager,
)

sio.register_namespace(chat_namespace)

# Proper ASGI mounting
app.mount("/socket.io", socketio.ASGIApp(sio))


def print_routes():
    for route in app.routes:
        if hasattr(route, "methods"):
            print(f"{route.methods} {route.path}")
        elif isinstance(route, Mount):
            print(f"MOUNT {route.path} -> {route.app}")


print_routes()
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, ws="websockets")

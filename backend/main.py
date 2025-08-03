import socketio
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import Mount  # Add this import
import jwt
from jwt import ExpiredSignatureError

# from jwt.exceptions import ExpiredSignatureError

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

from datetime import datetime
from collections import defaultdict
import logging
import asyncio
from pydantic import BaseModel, ValidationError

# from auth.middleware import SocketAuth #//implmenet http and socket middleware later

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
    transports=["websocket"],  # Enforce WebSocket-only
    async_handlers=True,
    logger=True,
    ping_timeout=60,
    ping_interval=25,
    # always_connect=True,
)


# auth = SocketAuth(sio)


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

from auth.models import *
from functools import wraps  # ✅ required for custom decorators like with_auth


TEST_MODE = False  # Enable for test tokens


def with_auth(handler):
    @wraps(handler)
    async def wrapper(sid, environ, auth):
        # logging.info(f"[ROOT] Auth Middleware: {auth}")
        try:
            logging.info(f"[ROOT] Auth Middleware: {auth}")

            # ✅ Validate the auth dict using AuthPayload model
            validated_auth = AuthPayload(**auth)
            logging.info(
                f"Passing validated_auth: {validated_auth} of type {type(validated_auth)}"
            )
            if TEST_MODE and auth.get("token") == "test-token":
                await sio.save_session(sid, {"user_id": "test-user-id"})
                return await handler(sid, environ, validated_auth)

            if not auth or "token" not in auth:
                raise ConnectionRefusedError("Missing or invalid auth")

            # ✅ Verify token
            payload = verify_token(validated_auth.token)
            user_id = payload.get("sub")
            await sio.save_session(sid, {"user_id": user_id})
            return await handler(
                sid, environ, validated_auth
            )  # <- Pass validated model

        except ValidationError as e:
            logging.warning(f"[AUTH VALIDATION ERROR] {e}")
            raise ConnectionRefusedError("Invalid auth format")
        except ExpiredSignatureError:
            logging.warning(f"[AUTH] Token expired for sid={sid}")
            raise ConnectionRefusedError("Token expired")
        except Exception as e:
            logging.error(f"[AUTH] Token verification failed: {e}")
            raise ConnectionRefusedError("Auth failed")

    return wrapper


# Root namespace connection handler
@sio.event
@with_auth
async def connect(sid, environ, auth: AuthPayload = None):
    """Root namespace connection handler with token auth"""
    try:
        logging.info(f"Root WS Connection SID: {sid}, auth={auth}")

        # Retrieve saved session with trusted user_id
        # session = await sio.get_session(sid)
        token = auth.token
        username = auth.username or "anonymous"
        user_id = auth.user_id

        session_data = {
            "user_id": user_id,
            "username": username,
            "authenticated": True,
            "token": token,
            "__main__": True,
        }

        await asyncio.gather(
            sio.save_session(sid, session_data),
            session_manager.create_session(sid, token),
            connection_manager.add_connection(sid=sid),
        )

        logging.info(
            f"✅ Root connect successful: sid={sid}, user_id={user_id}, username={username}"
        )

        await sio.emit("root_test", {"data": "Connected", "sid": sid}, to=sid)
        return True

    except Exception as e:
        logging.error(f"❌ Connection error for sid={sid}: {e}")
        return False


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


from models import *

subscriptions = defaultdict(set)  # event_name: set of sids


@sio.event
async def subscribe(sid, data):
    try:
        # Validate incoming payload
        payload = SubscribePayload(**data)

        # Optionally, check if the user is authorized to subscribe to this event
        # if not is_authorized(sid, payload.event):
        #     await sio.emit(f"{payload.event}:ack", {"success": False, "reason": "unauthorized"}, to=sid)
        #     return

        # Track the subscription
        subscriptions[payload.event].add(sid)

        logging.info(f"SID {sid} subscribed to event {payload.event}")

        # Acknowledge success
        # await sio.emit(f"{payload.event}:ack", {"success": True}, to=sid)
        return {"success": True, "event": payload.event, "sid": sid}

    except ValidationError as ve:
        logging.warning(
            f"Validation error for subscription payload from SID {sid}: {ve}"
        )
        await sio.emit("error", {"message": "Invalid subscription payload"}, to=sid)
        return {"success": False, "error": "Invalid subscription payload"}
    except Exception as e:
        logging.error(f"Unexpected error during subscribe: {e}")
        # await sio.emit("error", {"message": str(e)}, to=sid)
        return {"success": False, "error": str(e)}


@sio.on("*")
async def catch_all(event, sid, data):
    logging.info(f"Received [ALL EVENTS] Event: {event}, SID: {sid}, data: {data}")

    # await sio.emit(event, data, to=sid)
    # await sio.emit(event, {"data": data, "sid": sid})
    # await sio.emit(event, data)
    await connection_manager.send_to_room(event, data)

    return {
        "success": False,
        "error": f"No handler for event: {event}",
        "timestamp": datetime.now().isoformat(),
        "from": "ROOT EVENTS trigger",
    }


# @sio.on("*", namespace="/chat")
# async def catch_all_chat(event, sid, data):
#     logging.info(f"Received [ALL CHAT] Event: {event}, SID: {sid}, data: {data}")

#     # await sio.emit(event, data, to=sid)
#     # await sio.emit(event, {"data": data, "sid": sid})
#     # await sio.emit(event, data)
#     # await connection_manager.send_to_room(event, data)

#     return {
#         "success": True,
#         "event": event,
#         "timestamp": datetime.now().isoformat(),
#         "namespace": "chat",
#     }


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


@app.middleware("http")
async def catch_websocket_errors(request, call_next):
    try:
        return await call_next(request)
    except ValueError as e:
        if "Invalid transport" in str(e):
            return Response(
                status_code=400, content={"detail": "WebSocket transport required"}
            )


# sio.register_namespace(game_namespace)


# Initialize namespaces
chat_namespace = ChatNamespace(
    namespace="/chat",
    session_manager=session_manager,
    connection_manager=connection_manager,
)

sio.register_namespace(chat_namespace)

# Proper ASGI mounting
# app.mount("/socket.io", socketio.ASGIApp(sio))
app.mount("/socket.io", socketio.ASGIApp(sio, socketio_path="socket.io"))


def print_routes():
    for route in app.routes:
        if hasattr(route, "methods"):
            print(f"{route.methods} {route.path}")
        elif isinstance(route, Mount):
            print(f"MOUNT {route.path} -> {route.app}")


print_routes()
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, ws="websockets")

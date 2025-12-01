import sys
import os
import logging
import asyncio
from pathlib import Path
from collections import defaultdict
from datetime import datetime
from functools import wraps

import uvicorn
import socketio
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from backend.auth.routes import router as auth_router
from backend.game.routes import router as game_router
from backend.chat.routes import router as chat_router
from backend.auth.models import *
from backend.auth.service import verify_token
from backend.MockManagers import MockSessionManager, MockConnectionManager
from backend.chat.namespace import ChatNamespace
from backend.game.namespace import GameNamespace

# -----------------------------
# Logging
# -----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
    force=True,
)

logging.getLogger("chat.chat_namespace").setLevel(logging.INFO)
logging.getLogger("chat.connection_manager").setLevel(logging.INFO)
logging.getLogger(__name__).setLevel(logging.INFO)

# -----------------------------
# FastAPI + SocketIO
# -----------------------------
app = FastAPI()  # API endpoints under /api
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    engineio_logging=True,
    transports=["websocket", "polling"],
    async_handlers=True,
    logger=True,
    ping_timeout=60,
    ping_interval=25,
    socketio_path="socket.io",
)

# Prometheus metrics
instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Include routers
api_app = FastAPI()

api_app.include_router(auth_router)
api_app.include_router(game_router)
api_app.include_router(chat_router)

# Managers
session_manager = MockSessionManager()
connection_manager = MockConnectionManager(sio)

# Namespaces
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
sio.register_namespace(chat_namespace)
sio.register_namespace(game_namespace)


# @app.get("/healthcheck")
# async def healthcheck():
#     return {"status": "ok"}


# -----------------------------
# Static frontend (React SPA)
# -----------------------------

app.mount("/api", api_app)
app.mount("/socket.io", socketio.ASGIApp(sio, socketio_path="socket.io"))


# -----------------------------
# WebSocket events
# -----------------------------
TEST_MODE = True


def with_auth(handler):
    @wraps(handler)
    async def wrapper(sid, environ, auth):
        try:
            print("stuff")
            validated_auth = AuthPayload(**auth)
            if TEST_MODE and auth.get("token") == "test-token":
                await sio.save_session(sid, {"user_id": "test-user-id"})
                return await handler(sid, environ, validated_auth)
            if not auth or "token" not in auth:
                raise ConnectionRefusedError("Missing token")
            payload = verify_token(validated_auth.token)
            user_id = payload.get("sub")
            await sio.save_session(sid, {"user_id": user_id})
            return await handler(sid, environ, validated_auth)
        except Exception as e:
            raise ConnectionRefusedError("Auth failed")

    return wrapper


subscriptions = defaultdict(set)


@sio.event
# @with_auth
async def connect(sid, environ, auth: AuthPayload):
    print("auth payload:", auth)
    if not auth:
        print("no auth provided")
        return False

    auth = AuthPayload(**auth)
    token = auth.token
    username = auth.username or "anonymous"
    user_id = auth.user_id
    session_data = {
        "user_id": user_id,
        "username": username,
        "authenticated": True,
        "token": token,
    }
    await asyncio.gather(
        sio.save_session(sid, session_data),
        session_manager.create_session(sid, token),
        connection_manager.add_connection(sid=sid),
    )
    await sio.emit("root_test", {"data": "Connected", "sid": sid}, to=sid)
    return True


@sio.event
async def disconnect(sid):
    await session_manager.delete_session(sid)
    await connection_manager.remove_connection(sid)


@sio.event
async def subscribe(sid, data):
    payload = SubscribePayload(**data)
    subscriptions[payload.event].add(sid)
    return {"success": True, "event": payload.event, "sid": sid}


@sio.on("*")
async def catch_all(event, sid, data):
    await connection_manager.send_to_room(event, data)
    return {
        "success": False,
        "error": f"No handler for event: {event}",
        "timestamp": datetime.now().isoformat(),
        "from": "ROOT EVENTS trigger",
    }


# -----------------------------
# API endpoints
# -----------------------------


# @app.get("/")
# async def is_running():
#     return {"API IS RUNNING": "ok"}


@app.get("/healthcheck")
async def healthcheck():
    return {"status": "ok"}


@app.get("/connections/stats")
async def get_connection_stats():
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


# -----------------------------
# Prometheus metrics
# -----------------------------
metrics_router = FastAPI().router


@metrics_router.get("/metrics")
async def custom_metrics():
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)


app.include_router(metrics_router, prefix="")

print("WORKDIR CONTENTS:", os.listdir("/opt/render/project/src"))
project_root = Path(__file__).resolve().parent.parent

# frontend_dist_path = Path(__file__).parent / "dist"  # copied by Dockerfile to /app/dist
frontend_dist_path = project_root / "frontend" / "dist"
app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="frontend")


# Catch-all route for SPA routing (React Router)
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Check if file exists first
    requested_file = frontend_dist_path / full_path
    if requested_file.exists() and requested_file.is_file():
        return FileResponse(requested_file)
    # Otherwise return index.html for SPA routing
    return FileResponse(frontend_dist_path / "index.html")


# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    uvicorn.run("main:backend", host="0.0.0.0", port=8000, reload=True, ws="websockets")

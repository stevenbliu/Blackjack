import socketio
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import Mount  # Add this import

from auth.routes import router
import uvicorn
from urllib.parse import parse_qs  # For query string parsing

# Initialize Socket.IO server FIRST
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    engineio_logger=True,  # Enable for debugging
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
app.include_router(router)  # Remove prefix since it's already in routes.py


# WebSocket Connection Handler
@sio.event
async def connect(sid, environ):
    try:
        # Support both header and query token
        token = (
            environ.get("HTTP_AUTHORIZATION", "").replace("Bearer ", "")
            # elseparse_qs(environ.get("QUERY_STRING", "")).get("token", [""])[0]
        )

        if not token:
            raise ConnectionRefusedError("No token provided")

        # Verify token using your auth service
        payload = verify_token(token)
        if not payload:
            raise ConnectionRefusedError("Invalid token")

        await sio.save_session(
            sid, {"user_id": payload["sub"], "is_guest": payload.get("is_guest", False)}
        )

    except Exception as e:
        raise ConnectionRefusedError(str(e))


@app.get("/")
async def root():
    return {"status": "API is running"}


@app.get("/healthcheck")
async def healthcheck():
    return Response(status_code=200)


# Proper ASGI mounting
app.mount("/", socketio.ASGIApp(sio))


def print_routes():
    for route in app.routes:
        if hasattr(route, "methods"):
            print(f"{route.methods} {route.path}")
        elif isinstance(route, Mount):
            print(f"MOUNT {route.path} -> {route.app}")


print_routes()
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, ws="websockets")

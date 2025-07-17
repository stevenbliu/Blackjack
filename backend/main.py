import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import WebSocket
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)


class JoinRequest(BaseModel):
    game_id: str
    player_name: str


from game_manager import GameManager

# from backend.game_logic import create_game, join_game
from websocket_manager import websocket_endpoint
from connection_manager import ConnectionManager

logging.basicConfig(level=logging.INFO)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize GameManager
game_manager = GameManager()
manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_route(websocket: WebSocket):
    """Handle WebSocket connections."""
    print("Websocket attempt")
    await websocket_endpoint(websocket, game_manager)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to the game server!"}

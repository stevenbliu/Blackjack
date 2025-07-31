from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List

from game.service import GameService, Game

router = APIRouter(prefix="/api", tags=["game"])


# --- Request & Response Schemas ---
class CreateGameRequest(BaseModel):
    game_name: str
    host_player_id: str
    max_players: int = 4


class JoinGameRequest(BaseModel):
    game_id: str
    player_id: str


class CreateGameResponse(BaseModel):
    game: Game
    join_url: str


# --- Routes ---


@router.post("/create_game", response_model=CreateGameResponse)
def create_game(data: CreateGameRequest, request: Request):
    game = GameService.create_game(data)
    join_url = str(request.base_url) + f"api/games/{game.game_id}"
    return CreateGameResponse(game=game, join_url=join_url)


@router.post("/join_game", response_model=Game)
def join_game(data: JoinGameRequest):
    try:
        return GameService.join_game(data.game_id, data.player_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/games/{game_id}", response_model=Game)
def get_game(game_id: str):
    game = GameService.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.get("/games", response_model=List[Game])
def list_games():
    return GameService.list_games()

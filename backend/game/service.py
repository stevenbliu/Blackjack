# game/service.py

import uuid
from typing import List, Dict
from game.models import Game, GameData

# In-memory store
games: Dict[str, Game] = {}


class GameService:

    @staticmethod
    def create_game(data: GameData) -> Game:
        game_id = str(uuid.uuid4())
        room_id = str(uuid.uuid4())[:8]
        new_game = Game(
            game_id=game_id,
            room_id=room_id,
            name=data.game_name,
            host_player_id=data.host_player_id,
            max_players=data.max_players,
            players=[data.host_player_id],
        )
        games[game_id] = new_game
        return new_game

    @staticmethod
    def list_games() -> List[Game]:
        return list(games.values())

    @staticmethod
    def get_game(game_id: str) -> Game | None:
        return games.get(game_id)

    @staticmethod
    def join_game(game_id: str, player_id: str) -> Game:
        game = games.get(game_id)
        if not game:
            raise ValueError("Game not found")
        if player_id in game.players:
            return game
        if len(game.players) >= game.max_players:
            raise ValueError("Game is full")
        game.players.append(player_id)
        return game

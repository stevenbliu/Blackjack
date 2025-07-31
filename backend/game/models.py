from pydantic import BaseModel
from typing import List


class Game(BaseModel):
    game_id: str
    room_id: str
    name: str
    host_player_id: str
    max_players: int
    players: List[str]


class GameData:
    def __init__(self, game_name, host_player_id, max_players):
        self.game_name = game_name
        self.host_player_id = host_player_id
        self.max_players = max_players

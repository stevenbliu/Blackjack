import random
import uuid
import logging
import math
from starlette.websockets import WebSocket, WebSocketState


class GameManager:
    def __init__(self):
        self.games = {}
        self.connections = {}  # Maps player_id -> WebSocket
        self.num_players = 2

    def create_new_game(self):
        game_id = str(uuid.uuid4())
        logging.info(f"Creating new game: {game_id}")
        deck = self.generate_deck()
        random.shuffle(deck)
        dealer_hand = [self.deal_card(deck)]

        self.games[game_id] = {
            "game_id": game_id,
            "deck": deck,
            "dealer_hand": dealer_hand,
            "current_player": None,
            "status": "waiting",
            "players": {},
            "max_players": self.num_players,
            "started": False,
        }
        return self.games[game_id]

    def add_player_to_game(self, game, player_id, websocket: WebSocket):
        if player_id in game["players"]:
            logging.warning(f"Player {player_id} already in game")
            return False

        if len(game["players"]) >= game["max_players"]:
            logging.warning(f"Game {game['game_id']} is full")
            return False

        game["players"][player_id] = {"hand": [], "websocket": websocket}

        if len(game["players"]) == game["max_players"]:
            game["started"] = True
            game["status"] = "in_progress"
            game["current_player"] = list(game["players"].keys())[0]
            for player in game["players"].values():
                player["hand"] = [
                    self.deal_card(game["deck"]),
                    self.deal_card(game["deck"]),
                ]

        return True

    def generate_deck(self):
        SUITS = ["hearts", "spades", "clubs", "diamonds"]
        RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
        return [
            {
                "rank": rank,
                "suit": suit,
                "name": f"{rank} of {suit}",
                "CardName": f"{rank}_of_{suit}",
            }
            for suit in SUITS
            for rank in RANKS
        ]

    def deal_card(self, deck):
        return deck.pop() if deck else None

    def get_available_games(self, page: int = 1, limit: int = 10):
        all_games = [
            {
                "game_id": game_id,
                "players": list(game["players"].keys()),
                "max_players": game["max_players"],
            }
            for game_id, game in self.games.items()
            if not game["started"] and len(game["players"]) < game["max_players"]
        ]

        total_games = len(all_games)
        total_pages = max(1, math.ceil(total_games / limit))
        page = max(1, min(page, total_pages))
        start = (page - 1) * limit
        end = start + limit
        games_slice = all_games[start:end]

        return {
            "games": games_slice,
            "currentPage": page,
            "totalPages": total_pages,
            "totalGames": total_games,
        }

    def find_game_by_player(self, player_id):
        for game in self.games.values():
            if player_id in game["players"]:
                return game
        return None

    def add_connection(self, player_id: str, websocket: WebSocket):
        self.connections[player_id] = websocket

    def remove_connection(self, player_id: str):
        if player_id in self.connections:
            del self.connections[player_id]
            logging.info(f"Removed connection for player {player_id}")
        else:
            logging.warning(f"Connection for player {player_id} not found")

    def remove_player(self, player_id):
        for game_id, game in list(self.games.items()):
            if player_id in game["players"]:
                logging.info(f"Removing player {player_id} from game {game_id}")
                del game["players"][player_id]
                if not game["players"]:
                    logging.info(f"No players left. Deleting game {game_id}")
                    del self.games[game_id]

    async def broadcast_lobby(self, message: str):
        disconnected = []
        for player_id, ws in self.connections.items():
            try:
                if ws.application_state == WebSocketState.CONNECTED:
                    await ws.send_text(message)
                else:
                    disconnected.append(player_id)
            except Exception as e:
                logging.error(f"Failed to send lobby message to {player_id}: {e}")
                disconnected.append(player_id)

        for pid in disconnected:
            self.remove_connection(pid)

    async def broadcast_to_game(self, player_id: str, message: str):
        game = self.find_game_by_player(player_id)
        if not game:
            return

        disconnected = []
        for pid in game["players"]:
            ws = self.connections.get(pid)
            if ws and ws.application_state == WebSocketState.CONNECTED:
                try:
                    await ws.send_text(message)
                except Exception as e:
                    logging.error(f"Failed to send game message to {pid}: {e}")
                    disconnected.append(pid)
            else:
                disconnected.append(pid)

        for pid in disconnected:
            self.remove_connection(pid)

    async def send_private_message(self, from_id: str, to_id: str, message: str):
        for pid in [from_id, to_id]:
            ws = self.connections.get(pid)
            if ws and ws.application_state == WebSocketState.CONNECTED:
                try:
                    await ws.send_text(message)
                except Exception as e:
                    logging.error(f"Failed to send private message to {pid}: {e}")
                    self.remove_connection(pid)

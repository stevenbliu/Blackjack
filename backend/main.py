from fastapi import FastAPI
from pydantic import BaseModel
from backend.game_logic import Deck, calculate_score
import random
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modify if necessary
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory game state (for simplicity, use a dictionary)
games = {}
num_players = 1  # Number of players

class GameState:
    def __init__(self, player_hands, dealer_hand, deck, status):
        self.player_hands = player_hands  # List of hands for multiple players
        self.dealer_hand = dealer_hand
        self.dealer_full_hand = dealer_hand[:]  # Full dealer hand
        self.deck = deck
        self.status = status

@app.post("/start")
def start_game():
    deck = Deck()  # New deck
    # Draw two cards for each player (assuming 3 players here)
    players = [[deck.draw(), deck.draw()] for _ in range(num_players)]  # List of hands for 3 players
    dealer = [deck.draw(), deck.draw()]  # Dealer's hand

    game_id = str(random.randint(1000, 9999))  # Random game ID
    games[game_id] = GameState(
        player_hands=players,  # Hands for all players
        dealer_hand=[dealer[0]],  # Only show one dealer card initially
        deck=deck,
        status="in_progress"
    )
    games[game_id].dealer_full_hand = dealer  # Full dealer hand for backend use

    return {
        "game_id": game_id,
        "player_hands": players,  # Send all players' hands
        "dealer_hand": dealer,  # Send the visible dealer card
    }

@app.post("/hit/{game_id}/{player_index}")
def hit(game_id: str, player_index: int):
    game = games.get(game_id)
    if not game or game.status != "in_progress":
        return {"error": "Invalid game state"}

    if player_index >= len(game.player_hands):  # Ensure player index is valid
        return {"error": "Invalid player index"}

    card = game.deck.draw()  # Draw a card from the deck
    game.player_hands[player_index].append(card)
    score = calculate_score(game.player_hands[player_index])

    if score > 21:
        game.status = "player_bust"
        return {
            "game_id": game_id,
            "result": "player_bust",
            "player_hand": game.player_hands[player_index],  # Only send current player's hand
            "score": score
        }

    return {
        "game_id": game_id,
        "player_hand": game.player_hands[player_index],  # Only send current player's hand
        "score": score
    }

@app.post("/stand/{game_id}/{player_index}")
def stand(game_id: str, player_index: int):
    game = games.get(game_id)
    if not game or game.status != "in_progress":
        return {"error": "Invalid game state"}

    # Handle player standing logic
    dealer = game.dealer_full_hand
    while calculate_score(dealer) < 17:
        dealer.append(game.deck.draw())  # Dealer draws cards until they reach 17 or higher

    player_scores = [calculate_score(hand) for hand in game.player_hands]
    dealer_score = calculate_score(dealer)

    game.dealer_hand = dealer
    game.status = "finished"

    # Determine game results
    results = []
    for i, score in enumerate(player_scores):
        if score > 21:
            results.append({"player": i + 1, "result": "bust", "score": score})
        elif dealer_score > 21 or score > dealer_score:
            results.append({"player": i + 1, "result": "win", "score": score})
        elif score == dealer_score:
            results.append({"player": i + 1, "result": "draw", "score": score})
        else:
            results.append({"player": i + 1, "result": "loss", "score": score})

    return {
        "result": results,
        "dealer_score": dealer_score,
        "dealer_hand": dealer
    }

@app.post("/restart/{game_id}")
def restart_game(game_id: str):
    game = games.get(game_id)
    if not game:
        return {"error": "Game not found"}

    # Restart the game with a new deck and hands
    deck = Deck()
    players = [[deck.draw(), deck.draw()] for _ in range(3)]  # Reset players' hands
    dealer = [deck.draw(), deck.draw()]  # Reset dealer's hand

    game.deck = deck
    game.player_hands = players
    game.dealer_hand = [dealer[0]]  # Show only one dealer card initially
    game.dealer_full_hand = dealer
    game.status = "in_progress"

    return {
        "game_id": game_id,
        "player_hands": players,
        "dealer_hand": dealer
    }

# Serve static files (cards, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

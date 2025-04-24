from fastapi import FastAPI
from pydantic import BaseModel
from backend.game_logic import Deck, calculate_score
import random
import os
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS so JS frontend can call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory state (single-player only for now)
games = {}

class GameState:
    def __init__(self, player_hand, dealer_hand, deck, status):
        self.player_hand = player_hand
        self.dealer_hand = dealer_hand
        self.dealer_full_hand = dealer_hand[:]  # copy full dealer hand
        self.deck = deck
        self.status = status

@app.post("/start")
def start_game():
    deck = Deck()  # Use the new Deck class
    player = [deck.draw(), deck.draw()]  # Draw two cards for the player
    dealer = [deck.draw(), deck.draw()]  # Draw two cards for the dealer

    game_id = str(random.randint(1000, 9999))  # crude game ID
    games[game_id] = GameState(
        player_hand=player,
        dealer_hand=[dealer[0]],  # hide second card
        deck=deck,
        status="in_progress"
    )
    games[game_id].dealer_full_hand = dealer  # not part of schema, for backend use

        # Now return the dealer's full hand in the response, along with the player hand
    return {
        "game_id": game_id,
        "player_hand": player,
        "dealer_hand": dealer,  # Send the full dealer hand, not just the first card
    }
@app.post("/hit/{game_id}")
def hit(game_id: str):
    game = games.get(game_id)
    if not game or game.status != "in_progress":
        return {"error": "Invalid game"}

    card = game.deck.draw()  # Draw a card from the deck
    game.player_hand.append(card)
    score = calculate_score(game.player_hand)

    if score > 21:
        game.status = "player_bust"
        return {"game_id": game_id, "result": "player_bust", "player_hand": game.player_hand, "score": score}

    return {"game_id": game_id, "player_hand": game.player_hand, "score": score}

@app.post("/stand/{game_id}")
def stand(game_id: str):
    game = games.get(game_id)
    if not game or game.status != "in_progress":
        return {"error": "Invalid game"}

    dealer = game.dealer_full_hand
    while calculate_score(dealer) < 17:
        dealer.append(game.deck.draw())  # Dealer draws cards until their score is 17 or higher

    player_score = calculate_score(game.player_hand)
    dealer_score = calculate_score(dealer)

    game.dealer_hand = dealer
    game.status = "finished"

    if dealer_score > 21 or player_score > dealer_score:
        result = "player_wins"
    elif dealer_score == player_score:
        result = "draw"
    else:
        result = "dealer_wins"

    return {
        "result": result,
        "player_score": player_score,
        "dealer_score": dealer_score,
        "dealer_hand": dealer  # Send card names for frontend
    }
    
@app.get("/card/{card_name}")
def get_card(card_name: str):
    file_path = f"static/cards/{card_name}.svg"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='image/svg+xml')
    return {"error": "Card not found"}

# Serve static files (cards and other assets) from the static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve the frontend index.html file
@app.get("/", response_class=HTMLResponse)
async def read_index():
    # print("Serving index.html")  # Debug statement
    path = os.path.join("static", "index.html")
    try:
        if not os.path.exists(path):
            return HTMLResponse(content="index.html not found", status_code=404)
        with open(path, encoding="utf-8") as f:  # Specify the encoding here
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(content="index.html not found", status_code=404)

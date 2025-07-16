# backend/game_logic.py
import random


# Define the Card class
class Card:
    suit_map = {"♠": "spades", "♥": "hearts", "♦": "diamonds", "♣": "clubs"}

    rank_map = {
        "A": "ace",
        "2": "2",
        "3": "3",
        "4": "4",
        "5": "5",
        "6": "6",
        "7": "7",
        "8": "8",
        "9": "9",
        "10": "10",
        "J": "jack",
        "Q": "queen",
        "K": "king",
    }

    def __init__(self, rank, suit):
        self.rank = rank
        self.suit = suit
        self.name = f"{rank}{suit.lower()}"  # Format card name (e.g., '2_of_clubs')
        self.CardName = f"{self.rank_map[rank]}_of_{self.suit_map[suit]}"  # Use rank_map for card name

    def __repr__(self):
        return f"{self.rank} of {self.suit}"

    def value(self):
        """Get the value of the card (Ace = 11 or 1, face cards = 10)."""
        if self.rank in ["J", "Q", "K"]:
            return 10
        elif self.rank == "A":
            return 11
        else:
            return int(self.rank)


# Define the Deck class
class Deck:
    suits = ["♠", "♥", "♦", "♣"]
    ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

    def __init__(self):
        """Initialize the deck with 52 cards and shuffle it."""
        self.cards = [Card(rank, suit) for suit in self.suits for rank in self.ranks]
        random.shuffle(self.cards)

    def draw(self):
        """Draw a card from the deck."""
        return self.cards.pop() if self.cards else None

    def reset(self):
        """Reset the deck and shuffle it."""
        self.__init__()

    def __len__(self):
        """Return the number of cards left in the deck."""
        return len(self.cards)

    def __repr__(self):
        return f"Deck of {len(self.cards)} cards"

    def card_images(self):
        """Return a list of card image paths."""
        return [f"/static/cards/{card.name}.svg" for card in self.cards]


def calculate_score(hand):
    """Calculate the total score for a hand of cards."""
    score = 0
    aces = 0
    for card in hand:
        score += card.value()
        if card.rank == "A":
            aces += 1

    # Adjust for Aces (if score exceeds 21, make Aces worth 1 instead of 11)
    while score > 21 and aces:
        score -= 10
        aces -= 1
    return score

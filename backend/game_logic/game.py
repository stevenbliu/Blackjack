from backend.game_logic.deck import Deck
from backend.game_logic.score import calculate_score


class GameState:
    def __init__(self, player_hands, dealer_hand, deck, status, players):
        self.player_hands = player_hands  # List of hands for multiple players
        self.dealer_hand = dealer_hand
        self.dealer_full_hand = dealer_hand[:]  # Full dealer hand
        self.deck = deck
        self.status = status
        self.players = players  # List of WebSocket connections or player identifiers

    def draw_for_player(self, player_index):
        """Handles drawing a card for the player."""
        card = self.deck.draw()
        self.player_hands[player_index].append(card)
        return card

    def dealer_turn(self):
        """Handles the dealer's turn logic."""
        while calculate_score(self.dealer_hand) < 17:
            self.dealer_hand.append(self.deck.draw())

    def game_result(self):
        """Calculate final results after a player stands or busts."""
        dealer_score = calculate_score(self.dealer_hand)
        results = []
        for i, hand in enumerate(self.player_hands):
            player_score = calculate_score(hand)
            if player_score > 21:
                results.append(
                    {"player": i + 1, "result": "bust", "score": player_score}
                )
            elif dealer_score > 21 or player_score > dealer_score:
                results.append(
                    {"player": i + 1, "result": "win", "score": player_score}
                )
            elif player_score == dealer_score:
                results.append(
                    {"player": i + 1, "result": "draw", "score": player_score}
                )
            else:
                results.append(
                    {"player": i + 1, "result": "loss", "score": player_score}
                )
        return results

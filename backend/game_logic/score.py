def calculate_score(hand):
    """Calculate the score of a hand."""
    score = 0
    ace_count = 0

    for card in hand:
        if card.rank in ["J", "Q", "K"]:
            score += 10
        elif card.rank == "A":
            ace_count += 1
            score += 11  # Start by assuming Ace is 11
        else:
            score += int(card.rank)

    # Adjust for Aces if needed
    while score > 21 and ace_count:
        score -= 10
        ace_count -= 1

    return score

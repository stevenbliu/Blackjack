let gameId = null;

// Function to start a new game
function startGame() {
  fetch('/start', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      gameId = data.game_id;  // Store the game ID
      displayCards(data.player_hand, 'player');  // Display player's hand as images
      displayCards(data.dealer_hand, 'dealer');  // Display dealer's full hand
    //   document.getElementById('dealer').textContent = data.dealer_showing;  // Display dealer's showing card
      document.getElementById('message').textContent = "";  // Clear any messages
      toggleButtons(true);  // Enable 'Hit' and 'Stand' buttons
    });
}

// Function to handle 'Hit' action
function hit() {
  fetch(`/hit/${gameId}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      if (data.error) return alert(data.error);  // Handle error if any
      displayCards(data.player_hand, 'player');  // Update player's hand with images
      if (data.result === "bust") {  // If player busts
        document.getElementById('message').textContent = "You busted! 💥";
        toggleButtons(false);  // Disable buttons after bust
      }
    });
}

// Function to handle 'Stand' action
function stand() {
  fetch(`/stand/${gameId}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      displayCards(data.dealer_hand, 'dealer');  // Show dealer's hand with images
      let msg = {
        "player_wins": "You win! 🏆",
        "dealer_wins": "Dealer wins 😞",
        "draw": "It's a draw 🤝"
      }[data.result];  // Display result
      document.getElementById('message').textContent = msg;  // Show game result
      toggleButtons(false);  // Disable buttons after game finishes
    });
}

// Function to toggle the 'Hit' and 'Stand' buttons
function toggleButtons(enable) {
  document.querySelectorAll('button')[1].disabled = !enable;  // Disable 'Hit'
  document.querySelectorAll('button')[2].disabled = !enable;  // Disable 'Stand'
}

// Function to display cards as images
function displayCards(hand, player) {
  const handContainer = document.getElementById(player);
  handContainer.innerHTML = '';  // Clear previous hand
  hand.forEach(card => {
    const img = document.createElement('img');
    // console.log(card, player);  // Log the card for debugging
    // const cardName = card.replace('_', ' ').toLowerCase(); // Convert card name (e.g., "2_of_clubs") to "2 of clubs"
    // img.src = `/static/cards/${cardName}.svg`;  // Get the image for the card
    console.log('card name', card['CardName'], player);  // Log the image source for debugging
    img.src = `/static/cards/${card.CardName}.svg`;  // Get the image for the card
    img.alt = card;  // Set the alt text as the card's name
    img.style.width = '100px';  // You can adjust the size as needed
    img.style.margin = '0 5px';
    handContainer.appendChild(img);  // Add the card image to the container
  });
}

// import drawAnimation from './animations.js';

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
    handContainer.innerHTML = '';  // Clear previous cards
  
    hand.forEach((card, index) => {
      const img = document.createElement('img');
      img.src = `/static/cards/${card.CardName}.svg`;
      img.alt = card.CardName;
      img.style.width = '100px';
      img.style.margin = '0 10px';

      drawAnimation(img, handContainer, index);
    });
  }


function shuffle() {
    // document.getElementById('shuffle-button').addEventListener('click', () => {
        const cards = document.querySelectorAll('img');
      
        // Animate cards to random positions, rotations, and scales
        cards.forEach((card, index) => {
          gsap.to(card, {
            x: Math.random() * 300 - 150, // Random horizontal position
            y: Math.random() * 300 - 150, // Random vertical position
            rotation: Math.random() * 360 - 180, // Random rotation
            scale: Math.random() * 0.4 + 0.6, // Random scale between 0.6 and 1
            duration: 0.8,
            ease: "power2.out",
            delay: index * 0.1 // Delay each card slightly
          });
        });
      
        // Optionally, reset cards to their original positions
        setTimeout(() => {
          gsap.to(cards, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.5,
            ease: "power1.out"
          });
        }, 800); // Reset position after 800ms (when shuffle animation ends)
    //   });
      
}


console.log("animations.js loaded");

function drawAnimation(cardElement, container, index) {
  console.log("drawAnimation called", cardElement, container, index);
  container.appendChild(cardElement);
  
    // Get the bounding box of the deck
    const deck = document.getElementById('deck2');
    const deckRect = deck.getBoundingClientRect();
  
    // Get where the card will be placed
    const cardRect = container.getBoundingClientRect();
  
    // Calculate offsets from the deck to the container
    const offsetX = deckRect.left - cardRect.left;
    const offsetY = deckRect.top - cardRect.top;

    const dx = deckRect.left - cardRect.left;
    const dy = deckRect.top - cardRect.top;
  
    // Set initial transform based on deck position
    cardElement.style.transform = `translate(${dx}px, ${dy}px)`;
    cardElement.style.opacity = 1;


  
    // Animate to final position
    gsap.to(cardElement, {
      duration: 5,
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      ease: "power2.out",
      delay: index  // staggered deal
    });
  }
  
  window.drawAnimation = drawAnimation;


// Function to flip the card (both forward and back)
function flipCard(cardElement) {
  const isFlipped = cardElement.classList.contains('flipped');
  
  // If the card is not flipped, animate it to flip
  if (!isFlipped) {
    gsap.to(cardElement, {
      rotationY: 180, // Flip by 180 degrees
      duration: 0.6,
      ease: "power2.inOut"
    });
  } else {
    // If it's flipped, animate it back to its original position
    gsap.to(cardElement, {
      rotationY: 0,  // Flip it back to 0 degrees
      duration: 0.6,
      ease: "power2.inOut"
    });
  }
  
  // Toggle the 'flipped' class after animation to track the state
  cardElement.classList.toggle('flipped');
}


window.flipCard = flipCard;
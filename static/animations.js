function drawAnimation(cardElement, container, index) {
    container.appendChild(cardElement);
  
    // Get the bounding box of the deck
    const deck = document.getElementById('deck');
    const deckRect = deck.getBoundingClientRect();
  
    // Get where the card will be placed
    const cardRect = container.getBoundingClientRect();
  
    // Calculate offsets from the deck to the container
    const offsetX = deckRect.left - cardRect.left;
    const offsetY = deckRect.top - cardRect.top;
  
    // Set initial transform based on deck position
    cardElement.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0.1)`;
    cardElement.style.opacity = 0;
  
    // Animate to final position
    gsap.to(cardElement, {
      duration: 2,
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      ease: "power2.out",
      delay: index  // staggered deal
    });
  }
  
  window.drawAnimation = drawAnimation;
  
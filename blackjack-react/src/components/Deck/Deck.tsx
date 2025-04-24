import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';

const Deck = () => {
  const [cards, setCards] = useState<JSX.Element[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [shuffling, setShuffling] = useState(false);

  const totalCards = 52;
  const minCards = 5;
  const currCards = useRef(0);
  const shuffleOnNextRender = useRef(false);

  const generateCards = (num: number) => {
    if (currCards.current >= totalCards) return;

    const startIndex = currCards.current;
    const newCards: JSX.Element[] = [];

    console.log('Generating cards:', num, 'Current cards:', currCards.current);

    for (let i = 0; i < num; i++) {
      const index = startIndex + i;
      newCards.push(
        <div
          key={index}
          className="card"
          ref={(el) => (cardRefs.current[index] = el)}
          style={{ position: 'absolute' }}
        >
          <img
            src="http://localhost:8000/card/back_of_card"
            alt="card-back"
            width={100}
            height={150}
          />
        </div>
      );
    }

    currCards.current += num;
    setCards((prev) => [...prev, ...newCards]);
  };

  const animateDeck = () => {
    const timeline = gsap.timeline();

    timeline
      .set(cardRefs.current, { x: 0, y: 0, rotation: 0, z: 0 })
      .to(cardRefs.current, {
        x: () => Math.random() * 1200 - 100,
        y: () => Math.random() * 1200 - 100,
        rotation: () => Math.random() * 360,
        z: () => Math.random() * 200 - 100,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out',
      })
      .to(cardRefs.current, {
        x: 0,
        y: 0,
        rotation: 0,
        z: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'bounce.out',
        onComplete: () => setShuffling(false),
      });
  };

  const shuffleDeck = () => {
    if (shuffling) return;
    setShuffling(true);

    if (currCards.current < totalCards) {
      generateCards(minCards);
      shuffleOnNextRender.current = true;
    } else {
      animateDeck();
    }
  };

  useLayoutEffect(() => {
    if (shuffleOnNextRender.current) {
      shuffleOnNextRender.current = false;
      animateDeck();
    }
  }, [cards]);

  // Reset deck every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Resetting deck...');
      currCards.current = minCards;
      cardRefs.current.length = minCards;
      setCards((prev) => prev.slice(0, minCards));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Initial cards
  useEffect(() => {
    generateCards(minCards);
  }, []);

  return (
    <div
      className="deck-container"
      style={{
        position: 'relative',
        width: '200px',
        height: '500px',
        cursor: 'pointer',
        overflow: 'visible', // 👈 THIS is the key change
      }}
      onClick={shuffleDeck}
    >
      {cards}
    </div>
  );
};

export default Deck;

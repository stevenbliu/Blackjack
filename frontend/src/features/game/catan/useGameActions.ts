// useGameActions.ts
const placeSettlement = useCallback((position) => {
  if (isValidSettlement(position)) {
    setGameState(prev => ({
      ...prev,
      settlements: [...prev.settlements, { position, player: currentPlayer }]
    }));
  }
}, [currentPlayer]);
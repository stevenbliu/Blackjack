// components/TurnController.tsx
import React, { useState } from 'react'

export function TurnController() {
  const [lastRoll, setLastRoll] = useState<number | null>(null)

  const rollDice = () => {
    const roll = Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)
    setLastRoll(roll)
    // TODO: trigger resource distribution based on roll
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <button onClick={rollDice}>Roll Energy Dice</button>
      {lastRoll && <div>Energy Pulse: {lastRoll}</div>}
    </div>
  )
}

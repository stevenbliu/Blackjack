// components/PlayerPanel.tsx
import React from 'react'
import { typeEmojiMap } from '../assets/temp_assets'

const sampleResources = {
  fire: 2,
  water: 1,
  earth: 3,
  air: 0,
  aether: 1,
}

export function PlayerPanel() {
  return (
    <div
      style={{
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: 10,
      }}
    >
      {Object.entries(sampleResources).map(([type, count]) => (
        <div key={type}>
          {typeEmojiMap[type as keyof typeof typeEmojiMap]}: {count}
        </div>
      ))}
    </div>
  )
}

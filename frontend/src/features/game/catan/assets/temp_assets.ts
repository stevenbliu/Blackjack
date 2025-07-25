// assets/temp_assets.ts
export type ResourceType = 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'desert'

export const typeEmojiMap: Record<ResourceType, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌿',
  air: '🌬️',
  aether: '✨',
  desert: '⬜',
}

export const typeColorMap: Record<ResourceType, string> = {
  fire: '#e25822',
  water: '#00aaff',
  earth: '#8fbc8f',
  air: '#d3d3d3',
  aether: '#aa00ff',
  desert: '#f4e7c1',
}



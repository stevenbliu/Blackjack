type Player = {
  id: number
  color: string
  resources: Record<'fire' | 'earth' | 'water' | 'air' | 'aether', number>
  settlements: number[]
  cities: number[]
}

type Tile = {
  id: number
  type: string
  number: number | null
  hasStorm: boolean
}

type GameState = {
  currentPlayer: number
  players: Player[]
  board: Tile[]
  turn: number
}

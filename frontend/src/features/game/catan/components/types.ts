export type PortType = 'brick' | 'lumber' | 'wool' | 'grain' | 'ore' | 'generic';
export type Terrain = 'forest' | 'fields' | 'pasture' | 'hills' | 'mountains' | 'desert';

export interface Port {
  type: PortType;
  position: [number, number, number];
  rotation: number; // radians
}

export interface Settlement {
  position: [number, number, number];
  playerId: number;
  isCity: boolean;
}
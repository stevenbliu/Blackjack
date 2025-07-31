// utils/hexGrid.ts
import { Grid, defineHex } from 'honeycomb-grid';

export type TerrainType = 'forest' | 'fields' | 'pasture' | 'hills' | 'mountains' | 'desert';
export type PortType = 'brick' | 'lumber' | 'wool' | 'grain' | 'ore' | 'generic';

// 1. Define your custom hex class with proper dimensions
const CatanHex = defineHex({
  dimensions: {
    width: 2.08,   // 2 * radius (1.04)
    height: 1.8,   // width * √3/2
  },
  orientation: 'pointy',
  origin: 'center'
});

// 2. Type for hex properties
export type CatanHexInstance = ReturnType<typeof CatanHex> & {
  terrain: TerrainType;
  number?: number;
  position: [number, number, number];
};

// 3. Create grid factory function
export function createCatanGrid(): CatanHexInstance[] {
  const grid = new Grid(CatanHex, { radius: 2 });
  
  // Convert to array and add custom properties
  return Array.from(grid).map(hex => ({
    ...hex,
    terrain: 'fields', // Default value
    number: undefined,
    position: [hex.x, 0, hex.y] as [number, number, number]
  }));
}

// 4. Port position calculation
export function getPortPositions(hexagons: CatanHexInstance[]): Port[] {
  const portTypes: PortType[] = [
    'brick', 'lumber', 'wool', 'grain', 'ore', 'generic',
    'generic', 'generic', 'generic'
  ];
  const edgeMap = new Map<string, Port>();

  hexagons.forEach(hex => {
    if (hex.terrain === 'desert') return;

    const neighbors = [
      hex.neighbors()[0], // EAST
      hex.neighbors()[1], // NORTHEAST
      hex.neighbors()[2], // NORTHWEST
      hex.neighbors()[3], // WEST
      hex.neighbors()[4], // SOUTHWEST
      hex.neighbors()[5]  // SOUTHEAST
    ];

    for (let i = 0; i < 6; i++) {
      if (!neighbors[i] || !hexagons.some(h => h.x === neighbors[i]?.x && h.y === neighbors[i]?.y)) {
        const corners = hex.corners();
        const corner1 = corners[i];
        const corner2 = corners[(i + 1) % 6];
        const edgeKey = `${corner1.x},${corner1.y}|${corner2.x},${corner2.y}`;

        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, {
            type: portTypes[edgeMap.size % portTypes.length],
            position: [
              (corner1.x + corner2.x) / 2,
              0.25,
              (corner1.y + corner2.y) / 2
            ],
            rotation: Math.atan2(corner2.y - corner1.y, corner2.x - corner1.x)
          });
        }
      }
    }
  });

  return Array.from(edgeMap.values()).slice(0, 9);
}
// utils/buildManager.ts

type Position = [number, number, number]

interface Settlement {
  position: Position
  playerId: number
}

interface City {
  position: Position
  playerId: number
}

interface Road {
  start: Position
  end: Position
  playerId: number
}

export interface Buildings {
  settlements: Settlement[]
  cities: City[]
  roads: Road[]
}

type BuildParams =
  | {
      type: 'settlement' | 'city'
      position: [number, number, number]
      playerId: number
    }
  | {
      type: 'road'
      start: [number, number, number]
      end: [number, number, number]
      playerId: number
    }

export function addVertexBuilding(
  buildings: Buildings,
  type: 'settlement' | 'city',
  position: Position,
  playerId: number
): Buildings {
  const updated = { ...buildings }

  if (type === 'settlement') {
    if (hasSettlementAt(buildings, position)) return buildings

    updated.settlements = [
      ...buildings.settlements,
      { position, playerId }
    ]
    return updated
  }

  if (type === 'city') {
    if (!hasSettlementAt(buildings, position)) return buildings
    if (hasCityAt(buildings, position)) return buildings

    updated.cities = [
      ...buildings.cities,
      { position, playerId }
    ]
    updated.settlements = buildings.settlements.filter(s =>
      !arePositionsEqual(s.position, position)
    )
    return updated
  }

  console.warn(`Unknown vertex building type: ${type}`)
  return buildings
}

export function addEdgeBuilding(
  buildings: Buildings,
  // start: Position,
  // end: Position,
  position: { start: Position; end: Position },
  playerId: number
): Buildings {
  const start = position.start;
  const end = position.end;
  console.log("addEdgeBuilding", start, end, playerId);
  if (hasRoadBetween(buildings, start, end)) return buildings;

  return {
    ...buildings,
    roads: [...buildings.roads, { start, end, playerId }],
  };
}

/**
 * Central handler to route building placement to the correct builder.
 */
export function handleBuild(
  buildings: Buildings,
  params: BuildParams,

): Buildings {

  console.log("handleBuild", params);
  console.log("buildings", buildings);
  
  const { type, playerId } = params

  if (type === 'settlement' || type === 'city') {
    return addVertexBuilding(buildings, type, params.position, playerId)
  }

  if (type === 'road') {
    // return addEdgeBuilding(buildings, params.position, playerId)
      params.position.mesh.material.opacity = 1;
      params.position.mesh.material.transparent = false;
      params.position.mesh.material.color.set("orange");

  }

  console.warn(`Unhandled build type: ${type}`)
  return buildings
}


// Helpers
export function arePositionsEqual(a: Position, b: Position, tolerance = 0.01) {
  return (
    Math.abs(a[0] - b[0]) < tolerance &&
    Math.abs(a[1] - b[1]) < tolerance &&
    Math.abs(a[2] - b[2]) < tolerance
  )
}

function hasSettlementAt(buildings: Buildings, position: Position): boolean {
  return buildings.settlements.some(s => arePositionsEqual(s.position, position))
}

function hasCityAt(buildings: Buildings, position: Position): boolean {
  return buildings.cities.some(c => arePositionsEqual(c.position, position))
}

function hasRoadBetween(buildings: Buildings, start: Position, end: Position): boolean {
  return buildings.roads.some(r =>
    (arePositionsEqual(r.start, start) && arePositionsEqual(r.end, end)) ||
    (arePositionsEqual(r.start, end) && arePositionsEqual(r.end, start)) // bidirectional
  )
}

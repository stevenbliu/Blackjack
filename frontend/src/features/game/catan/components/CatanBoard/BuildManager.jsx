// utils/BuildManager.jsx

/**
 * @typedef {[number, number, number]} Position
 */

/**
 * @typedef {Object} Settlement
 * @property {Position} position
 * @property {number} playerId
 */

/**
 * @typedef {Object} City
 * @property {Position} position
 * @property {number} playerId
 */

/**
 * @typedef {Object} Road
 * @property {Position} start
 * @property {Position} end
 * @property {number} playerId
 */

/**
 * @typedef {Object} Buildings
 * @property {Settlement[]} settlements
 * @property {City[]} cities
 * @property {Road[]} roads
 */

/**
 * Add a settlement or city at a vertex
 */
export function addVertexBuilding(buildings, type, position, playerId) {
  const updated = { ...buildings };

  if (type === 'settlement') {
    if (hasSettlementAt(buildings, position)) return buildings;

    updated.settlements = [...buildings.settlements, { position, playerId }];
    return updated;
  }

  if (type === 'city') {
    if (!hasSettlementAt(buildings, position)) return buildings;
    if (hasCityAt(buildings, position)) return buildings;

    updated.cities = [...buildings.cities, { position, playerId }];
    updated.settlements = buildings.settlements.filter(
      (s) => !arePositionsEqual(s.position, position)
    );
    return updated;
  }

  console.warn(`Unknown vertex building type: ${type}`);
  return buildings;
}

/**
 * Add a road between two positions
 */
export function addEdgeBuilding(buildings, position, playerId) {
  const start = position.start;
  const end = position.end;
  console.log('addEdgeBuilding', start, end, playerId);

  if (hasRoadBetween(buildings, start, end)) return buildings;

  return {
    ...buildings,
    roads: [...buildings.roads, { start, end, playerId }],
  };
}

/**
 * Central handler for building placement
 */
export function handleBuild(buildings, params) {
  console.log('handleBuild', params);
  console.log('buildings', buildings);

  const { type, playerId } = params;

  if (type === 'settlement' || type === 'city') {
    return addVertexBuilding(buildings, type, params.position, playerId);
  }

  if (type === 'road') {
    // If you want to manipulate mesh properties in runtime
    if (params.position.mesh) {
      params.position.mesh.material.opacity = 1;
      params.position.mesh.material.transparent = false;
      params.position.mesh.material.color.set('orange');
    }
  }

  console.warn(`Unhandled build type: ${type}`);
  return buildings;
}

/**
 * Helper: check if positions are approximately equal
 */
export function arePositionsEqual(a, b, tolerance = 0.01) {
  return (
    Math.abs(a[0] - b[0]) < tolerance &&
    Math.abs(a[1] - b[1]) < tolerance &&
    Math.abs(a[2] - b[2]) < tolerance
  );
}

// Internal helpers
function hasSettlementAt(buildings, position) {
  return buildings.settlements.some((s) => arePositionsEqual(s.position, position));
}

function hasCityAt(buildings, position) {
  return buildings.cities.some((c) => arePositionsEqual(c.position, position));
}

function hasRoadBetween(buildings, start, end) {
  return buildings.roads.some(
    (r) =>
      (arePositionsEqual(r.start, start) && arePositionsEqual(r.end, end)) ||
      (arePositionsEqual(r.start, end) && arePositionsEqual(r.end, start))
  );
}

// utils/hexVertices.ts
import { hexToPoint } from 'honeycomb-grid'
import React from 'react'

const HEX_RADIUS = 1;
const ANGLE_OFFSET = Math.PI / 3; 

/**
 * Returns world-space corner positions of a given hex
 */
export function getHexCornerPositions(hex) {
  const { x: cx, y: cy } = hexToPoint(hex); // center of hex
  const corners = [];

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + ANGLE_OFFSET;
    const x = cx + HEX_RADIUS * Math.cos(angle);
    const z = cy + HEX_RADIUS * Math.sin(angle);
    corners.push([x, 0, z]);
  }

  return corners;
}


// components/renders/RenderPlaceableVertices.tsx

export function RenderPlaceableVertices({ positions, onClick }) {
  return positions.map((pos, idx) => (
    <mesh key={`placeable-${idx}`} position={pos} onClick={() => onClick(pos)}>
      <sphereGeometry args={[0.2, 20, 20]} />
      <meshStandardMaterial color="green" emissive="yellow" emissiveIntensity={2.5} />
    </mesh>
  ))
}

// utils
const isTooClose = (pos1, pos2, threshold = 0.8) => {
  const dx = pos1[0] - pos2[0];
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dz * dz) < threshold;
}

/**
 * Returns world-space vertex positions where a settlement could be placed
 * @param hexData Array of hexes (with terrain, tokens, etc.)
 * @param settlements Existing settlements to avoid placing too close
 * @param Hex The hex factory (used to map axial to world-space)
 */
export function getPlaceableVertexPositions(hexData, settlements, Hex) {
  const vertexMap = new Map();

  for (const { hex } of hexData) {
    const corners = getHexCornerPositions(hex);
    for (const pos of corners) {
      const key = pos.map(n => n.toFixed(2)).join(',');
      if (!vertexMap.has(key)) {
        vertexMap.set(key, pos);
      }
    }
  }

  const allVertexPositions = Array.from(vertexMap.values());

  const placeableVertexPositions = allVertexPositions.filter(vertexPos => {
    return !settlements.some(settlement => {
      const hex = new Hex({ q: settlement.position[0], r: settlement.position[1] });
      const { x, y } = hexToPoint(hex);
      const settlementPos = [x, 0.4, y];
      return isTooClose(vertexPos, settlementPos);
    });
  });

  return placeableVertexPositions;
}

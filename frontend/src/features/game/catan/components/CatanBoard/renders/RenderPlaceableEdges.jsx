import React, { useMemo } from 'react'
import { hexToPoint } from 'honeycomb-grid'
import { CylinderGeometry, Euler, MathUtils } from 'three'
import { Text, Billboard, Line } from '@react-three/drei'
import * as THREE from 'three'

const HEX_RADIUS = 1

/**
 * Generate edges for each hex independently (6 edges per hex).
 * Useful for isolated hexes or fallback.
 */
function getHexEdgesFromCenters(hexData) {
  const edges = []
  const ANGLE_OFFSET = Math.PI / 6 // 30° offset for pointy hex orientation

  for (const { hex } of hexData) {
    const { x: cx, y: cy } = hexToPoint(hex)
    const numEdges = 6; //6
    for (let i = 0; i < numEdges; i++) {
      const edgeAngle = (Math.PI / 3) * i //+ ANGLE_OFFSET
      // const edgeAngle = i // * + ANGLE_OFFSET;

      const start = [
        cx + HEX_RADIUS * Math.cos(edgeAngle),
        0,
        cy + HEX_RADIUS * Math.sin(edgeAngle),
      ]
      // const start = [
      //   cx + HEX_RADIUS * Math.cos(edgeAngle),
      //   cy + HEX_RADIUS * Math.sin(edgeAngle),
      //   1
      // ]

      // const start = [0, 0, 2]

      const end = [
        cx + HEX_RADIUS * Math.cos(edgeAngle + Math.PI / 3),
        0,
        cy + HEX_RADIUS * Math.sin(edgeAngle + Math.PI / 3),
      ]

      const midpoint = [
        (start[0] + end[0]) / 2,
        0,
        (start[2] + end[2]) / 2,
      ]

      const length = Math.sqrt(
        (end[0] - start[0]) ** 2 +
        (end[2] - start[2]) ** 2
        // (end[2] - start[2]) ** 2
      )

      const rotation = new Euler(Math.PI / 2, edgeAngle, 0, 'YXZ')

      // Use sorted key to avoid duplicates later
      const key = [start, end].sort((a, b) =>
        a[0] - b[0] || a[2] - b[2]
      ).map(p => p.join(',')).join('|')

      console.log(`Hex center: (${cx.toFixed(2)}, ${cy.toFixed(2)})`);
      // console.log(`Edge ${i}: start=(${start[0].toFixed(2)}, ${start[2].toFixed(2)}), end=(${end[0].toFixed(2)}, ${end[2].toFixed(2)})`);
      edges.push({ start, end, midpoint, length, rotation, key })
      // break; // debug to only show one edge

    }
  }

  return edges
}

/**
 * Generate edges only between neighboring hexes.
 * Prevents duplicate edges by tracking a Set.
 */
function getSharedEdges(hexData, Hex) {
  const edgeSet = new Set()
  const edges = []

  // Map for quick lookup
  const hexMap = new Map(hexData.map(({ hex }) => [`${hex.q},${hex.r}`, hex]))

  // Hex neighbor directions (pointy top orientation)
  const directions = [
    [1, 0], [1, -1], [0, -1],
    [-1, 0], [-1, 1], [0, 1]
  ]

  for (const { hex } of hexData) {
    const { q, r } = hex
    const { x: x1, y: y1 } = hexToPoint(hex)

    for (const [dq, dr] of directions) {
      const neighborKey = `${q + dq},${r + dr}`
      const neighbor = hexMap.get(neighborKey)
      if (!neighbor) continue // skip missing neighbors

      const { x: x2, y: y2 } = hexToPoint(neighbor)

      const key = [[x1, y1], [x2, y2]].sort((a, b) =>
        a[0] - b[0] || a[1] - b[1]
      ).map(p => p.join(',')).join('|')

      if (edgeSet.has(key)) continue // already added
      edgeSet.add(key)

      const start = [x1, 0, y1]
      const end = [x2, 0, y2]
      const midpoint = [(x1 + x2) / 2, 0, (y1 + y2) / 2]
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

      const angle = Math.atan2(y2 - y1, x2 - x1)
      const rotation = new Euler(Math.PI / 2, angle, 0, 'YXZ')

      edges.push({ start, end, midpoint, length, rotation, key })
    }
  }

  return edges
}

/**
 * Wrapper to get edges for any board, combining shared edges and isolated hex edges,
 * avoiding duplicates.
 */
function getAllEdgesWithFallback(hexData, Hex) {
  const sharedEdges = getSharedEdges(hexData, Hex)
  const centerEdges = getHexEdgesFromCenters(hexData)

  // Put all shared edge keys in a Set to avoid duplicates
  const sharedKeys = new Set(sharedEdges.map(e => e.key))

  // Filter centerEdges to exclude duplicates already in sharedEdges
  const filteredCenterEdges = centerEdges.filter(e => !sharedKeys.has(e.key))

  return [...sharedEdges, ...filteredCenterEdges]
}

const isTooClose = (pos1, pos2, threshold = 0.5) => {
  const dx = pos1[0] - pos2[0]
  const dz = pos1[2] - pos2[2]
  return Math.sqrt(dx * dx + dz * dz) < threshold
}

export function getPlaceableEdgePositions(hexData, roads, Hex) {
  const allEdges = getAllEdgesWithFallback(hexData, Hex)
  console.log(`All edges count: ${allEdges.length}`)

  return allEdges.filter(({ midpoint }) => {
    return !roads.some(road => {
      const hex = new Hex({ q: road.position[0], r: road.position[1] })
      const { x, y } = hexToPoint(hex)
      const roadPos = [x, 0, y]
      return isTooClose(midpoint, roadPos)
    })
  })
}

/**
 * Render placeable edges as cylinders correctly rotated and scaled,
 * applying a fixed rotation offset to all edges.
 */
export function RenderPlaceableEdges({ positions, onClick }) {
  const geometry = useMemo(() => {
    const geo = new CylinderGeometry(0.05, 0.05, 1, 8)
    // geo.rotateZ(Math.PI / 2) // Lie cylinder on X-axis by default
    return geo
  }, [])

  const ANGLE = Math.PI/ 20 // fixed rotation offset if needed

  return positions.map(({ start, end, midpoint, length, rotation }, idx) => {
    console.log(`Edge #${idx}`, {
      start,
      end,
      midpoint,
      rotationDegY: MathUtils.radToDeg(rotation.y).toFixed(1),
      length: length.toFixed(2),
    })

    const adjustedRotation = new Euler(
      rotation.x,
      rotation.y + ANGLE,
      // rotation.y,
      rotation.z,
      rotation.order
    )

    function getRotationFromVector(start, end) {
      const startVec = new THREE.Vector3(...start);
      const endVec = new THREE.Vector3(...end);
      
      const dir = new THREE.Vector3().subVectors(endVec, startVec);
      
      if (dir.length() === 0) {
        console.warn('Start and end points are identical.');
        return new THREE.Euler(0, 0, 0);
      }
      
      dir.normalize();

      const up = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir);
      const euler = new THREE.Euler().setFromQuaternion(quaternion);

      console.log(`Rotation: [${euler.x}, ${euler.y}, ${euler.z}]`);

      return euler;
    }


    // GRIDLINES


return (
  <React.Fragment key={`placeable-edge-${idx}`}>
    <mesh
      position={midpoint}
      rotation={getRotationFromVector(start, end)}
      geometry={geometry}
      onClick={() => onClick({ start, end })}
    >
      <meshStandardMaterial
        color="purple"
        emissive="purple"
        transparent={true}
        opacity={0.2}
      />
      <Billboard>
        <Text
          position={[0, 0, 1]}
          fontSize={0.5}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {idx}
        </Text>
      </Billboard>
    </mesh>

    {/* Debug spheres */}
    {(idx === 0 || idx === 0) && (
      <>
        <mesh position={start}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="blue" />
        </mesh>
        <mesh position={end}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
        <mesh position={midpoint}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="green" />
        </mesh>
      </>
    )}
  </React.Fragment>
);

  })
}

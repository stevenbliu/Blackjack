import React, { useMemo } from 'react'
import { Vector3, Euler } from 'three'

/**
 * Road component representing a single road between two points
 *
 * @param {Object} props
 * @param {[number, number, number]} props.start - Start position [x, y, z]
 * @param {[number, number, number]} props.end - End position [x, y, z]
 * @param {Function} [props.onClick] - Optional click handler
 * @param {number} [props.width] - Radius of the road cylinder
 * @param {number} [props.length] - Length of the road (defaults to distance between start and end)
 */
export function Road({
  start,
  end,
  onClick,
  width = 0.05,
  length,
}) {
  // Convert array positions to Vector3
  const startVec = useMemo(() => new Vector3(...start), [start])
  const endVec = useMemo(() => new Vector3(...end), [end])

  // Compute midpoint
  const midpoint = useMemo(() => startVec.clone().add(endVec).multiplyScalar(0.5), [startVec, endVec])

  // Compute length if not provided
  const roadLength = length ?? startVec.distanceTo(endVec)

  // Compute rotation to align cylinder between start and end
  const rotation = useMemo(() => {
    const direction = endVec.clone().sub(startVec).normalize()
    // Calculate angle between direction vector and positive X-axis (1,0,0)
    const angle = Math.atan2(direction.z, direction.x)
    // Rotate around Y axis by this angle to align road with edge
    return new Euler(0, -angle, Math.PI / 2) // cylinder points +Y by default, rotate accordingly
  }, [startVec, endVec])

  return (
    <mesh position={midpoint} rotation={rotation} onClick={onClick} castShadow receiveShadow>
      <cylinderGeometry args={[width, width, roadLength, 8]} />
      <meshStandardMaterial color="brown" emissive="red" emissiveIntensity={1.2} />
    </mesh>
  )
}

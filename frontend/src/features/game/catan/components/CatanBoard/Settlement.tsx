import * as THREE from 'three'

export function Settlement({ position, color }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color={color || 'orange'} />
    </mesh>
  )
}

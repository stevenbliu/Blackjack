// components/renders/RenderPlaceableEdges.jsx
import React from 'react'

export function RenderPlaceableEdges({ positions, onClick }) {
  return positions.map((pos, idx) => (
    <mesh 
      key={`edge-${idx}`} 
      position={pos} 
      onClick={() => onClick(pos)}
    >
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial 
        color="blue" 
        emissive="cyan" 
        emissiveIntensity={0.5} 
      />
    </mesh>
  ))
}

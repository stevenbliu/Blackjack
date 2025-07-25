import * as THREE from 'three';

export function Settlement({ position, playerColor, isCity = false }: {
  position: [number, number, number];
  playerColor: string;
  isCity?: boolean;
}) {
  return (
    <group position={position}>
      {isCity ? (
        // City (tower)
        <group>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.5, 0.3, 0.8, 4]} />
            <meshStandardMaterial color={playerColor} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <coneGeometry args={[0.4, 0.4, 4]} />
            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.3} />
          </mesh>
        </group>
      ) : (
        // Settlement (house)
        <group>
          <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI/4, 0]}>
            <coneGeometry args={[0.4, 0.6, 4]} />
            <meshStandardMaterial color={playerColor} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 4]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        </group>
      )}
    </group>
  );
}
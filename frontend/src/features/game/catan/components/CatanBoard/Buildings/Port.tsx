import { Text } from '@react-three/drei';
import * as THREE from 'three';

const PORT_SCALE = 1.8; // Increased size

export function Port({ type, position, rotation }: PortProps) {
  const emojiMap = {
    brick: '🧱', lumber: '🪵', wool: '🧶', 
    grain: '🌾', ore: '⛏️', generic: '🔄'
  };

  return (
    <group 
      position={[position[0], 0.2, position[2]]} // Elevated
      rotation={[0, rotation, 0]}
      scale={[PORT_SCALE, PORT_SCALE, PORT_SCALE]}
    >
      {/* Dock Base */}
      <mesh receiveShadow>
        <boxGeometry args={[1, 0.1, 0.6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      
      {/* Trade Indicator */}
      <Text
        position={[0, 0.15, 0.4]}
        fontSize={0.4}
        rotation={[-Math.PI/6, 0, 0]}
        color="black"
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="white"
      >
        {type === 'generic' ? '3:1' : `2:1`}
      </Text>
      
      {/* Emoji Icon */}
      <Text
        position={[0, 0.15, 0]}
        fontSize={0.6}
        rotation={[-Math.PI/6, 0, 0]}
        anchorX="center"
      >
        {emojiMap[type]}
      </Text>
    </group>
  );
}
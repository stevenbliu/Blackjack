import { useMemo, useState } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import {typeColorMap, typeEmojiMap, ResourceType}  from '../../assets/temp_assets';

Object.keys(typeEmojiMap)

interface HexagonProps {
  position: [number, number, number];
  terrainType: ResourceType;
  numberToken?: number;
  hasRobber?: boolean;
  onClick?: () => void;
  highlight?: boolean;
}



export function Hexagon(props: HexagonProps) {
  const [hovered, setHover] = useState(false);
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Draw hex background
    ctx.fillStyle = props.highlight ? '#e0ffe0' : typeColorMap[props.terrainType];
    ctx.fillRect(0, 0, 256, 256);
    
    if (props.highlight) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 246, 246);
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [props.terrainType, props.highlight]);

  return (
    <group position={props.position}>
      <mesh
        rotation={[0, Math.PI/6, 0]}
        castShadow
        receiveShadow
        onClick={props.onClick}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <cylinderGeometry args={[1.0, 1.0, 0.3, 6]} />
        <meshStandardMaterial 
          map={texture}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {props.numberToken && (
        <Text
          position={[0, 0.35, 0]}
          fontSize={0.5}
          color={props.numberToken === 6 || props.numberToken === 8 ? '#ff0000' : '#000000'}
          outlineWidth={0.01}
          outlineColor="#ffffff"
        >
          {props.numberToken}
        </Text>
      )}

      {props.hasRobber && (
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1, 6]} />
          <meshStandardMaterial 
            color="#333" 
            roughness={0.7}
            emissive="#ff0000"
            emissiveIntensity={hovered ? 0.5 : 0}
          />
        </mesh>
      )}
    </group>
  );
}
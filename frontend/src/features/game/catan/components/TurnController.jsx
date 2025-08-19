// DiceRoller3D.tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Physics, useBox, usePlane } from "@react-three/cannon";
import { Suspense } from "react";
// import * as THREE from "three";

// Ground plane
function Plane() {
  usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -1.5, 0],
  }));
  return (
  <mesh receiveShadow>
    <planeGeometry args={[10, 10]} />
    <shadowMaterial opacity={0.3} />
  </mesh>
  );
}

function BoxWalls() {
  const wallThickness = 0.2;
  const boxSize = 5;

  const walls = [
    // Floor
    { pos: [0, -wallThickness / 2, 0], rot: [0, 0, 0], size: [boxSize, wallThickness, boxSize] },
    // Ceiling
    { pos: [0, boxSize / 2 + wallThickness / 2, 0], rot: [0, 0, 0], size: [boxSize, wallThickness, boxSize] },
    // Left wall
    { pos: [-boxSize / 2, boxSize / 4, 0], rot: [0, 0, 0], size: [wallThickness, boxSize, boxSize] },
    // Right wall
    { pos: [boxSize / 2, boxSize / 4, 0], rot: [0, 0, 0], size: [wallThickness, boxSize, boxSize] },
    // Front wall
    { pos: [0, boxSize / 4, boxSize / 2], rot: [0, 0, 0], size: [boxSize, boxSize, wallThickness] },
    // Back wall
    { pos: [0, boxSize / 4, -boxSize / 2], rot: [0, 0, 0], size: [boxSize, boxSize, wallThickness] },
  ];

  return (
    <>
      {walls.map(({ pos, rot, size }, i) => (
        <Wall key={i} position={pos} rotation={rot} size={size} />
      ))}
    </>
  );
}

function Wall({ position, rotation, size }) {
  const [ref] = useBox(() => ({
    args: size,
    position,
    rotation,
    type: "Static",
  }));

  return (
    <mesh ref={ref}>
      <boxGeometry args={size} />
      <meshBasicMaterial color="#999" wireframe />
    </mesh>
  );
}


// Dice with numbers 1–6
function Dice() {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 2, 0],
    args: [1, 1, 1],
  }));

const roll = () => {
  const randomSign = () => (Math.random() < 0.5 ? -1 : 1);
  
  // Higher linear velocity
  api.velocity.set(
    randomSign() * (Math.random() * 5 + 5),
    Math.random() * 5 + 5,
    randomSign() * (Math.random() * 5 + 5)
  );

  // Much higher angular velocity = more spin
  api.angularVelocity.set(
    randomSign() * (Math.random() * 20 + 10),
    randomSign() * (Math.random() * 20 + 10),
    randomSign() * (Math.random() * 20 + 10)
  );
};


  return (
    <group onClick={roll}>
      <mesh ref={ref}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#fff" />

        {/* Add number labels on each face */}
        {/* Front (1) */}
        <Text position={[0, 0, 0.51]} fontSize={0.4} color="black">
          1
        </Text>
        {/* Back (6) */}
        <Text position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} fontSize={0.4} color="black">
          6
        </Text>
        {/* Top (2) */}
        <Text position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="black">
          2
        </Text>
        {/* Bottom (5) */}
        <Text position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]} fontSize={0.4} color="black">
          5
        </Text>
        {/* Right (3) */}
        <Text position={[0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.4} color="black">
          3
        </Text>
        {/* Left (4) */}
        <Text position={[-0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.4} color="black">
          4
        </Text>
      </mesh>
    </group>
  );
}

export default function DiceRoller() {
  return (
    <div className="w-full h-[500px]">
      <Canvas shadows camera={{ position: [6, 6, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Plane />
            <BoxWalls />
            <Dice />
          </Physics>
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
}

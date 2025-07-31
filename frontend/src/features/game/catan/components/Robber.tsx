// Robber.tsx
function Robber({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 
        Math.sin(state.clock.getElapsedTime() * 2) * 0.1 + 0.5;
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <coneGeometry args={[0.4, 0.8, 5]} />
      <meshStandardMaterial 
        color="#333" 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}
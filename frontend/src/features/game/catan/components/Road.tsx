// Road.tsx
function Road({ start, end, color }: RoadProps) {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + 
    Math.pow(end[2] - start[2], 2)
  );
  
  const center = [
    (start[0] + end[0]) / 2,
    0.1,
    (start[2] + end[2]) / 2
  ];

  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);

  return (
    <group position={center as [number, number, number]}>
      <mesh rotation={[0, angle, 0]}>
        <boxGeometry args={[length, 0.1, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
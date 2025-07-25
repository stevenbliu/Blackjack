// PlayerPiece.tsx
function Settlement({ color, position, isCity = false }: PieceProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        {isCity ? (
          <boxGeometry args={[0.6, 0.4, 0.6]} />
        ) : (
          <coneGeometry args={[0.5, 0.8, 4]} />
        )}
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
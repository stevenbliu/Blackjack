// TurnIndicator.tsx
function TurnIndicator({ player }) {
  return (
    <group position={[0, 10, 0]}>
      <Text
        fontSize={2}
        color={player.color}
        outlineWidth={0.1}
        outlineColor="#000"
      >
        {`${player.name}'s Turn`}
      </Text>
      <mesh position={[0, -1.5, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color={player.color} />
      </mesh>
    </group>
  );
}
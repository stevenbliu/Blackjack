// ResourceHand.tsx
function ResourceCard({ type, count }: ResourceCardProps) {
  return (
    <group>
      <mesh rotation={[0, Math.PI/4, 0]}>
        <boxGeometry args={[1.5, 0.1, 2]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <Text
        position={[0, 0.11, 0]}
        fontSize={0.5}
        color="black"
      >
        {`${RESOURCE_EMOJIS[type]} ×${count}`}
      </Text>
    </group>
  );
}
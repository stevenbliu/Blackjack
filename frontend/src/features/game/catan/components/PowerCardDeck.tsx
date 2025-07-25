// DevCard.tsx
const CARD_TYPES = {
  knight: '⚔️',
  victory: '🏆',
  monopoly: '🃏',
  road: '🛣️',
  plenty: '🎁'
};

function DevCard({ type, faceUp = false }: DevCardProps) {
  return (
    <mesh rotation={[0, faceUp ? 0 : Math.PI, 0]}>
      <boxGeometry args={[1.2, 0.05, 1.8]} />
      <meshStandardMaterial 
        color={faceUp ? "#f8f8f8" : "#1a3e72"}
      />
      {faceUp && (
        <Text
          position={[0, 0.06, 0]}
          fontSize={0.7}
          color="black"
        >
          {CARD_TYPES[type]}
        </Text>
      )}
    </mesh>
  );
}
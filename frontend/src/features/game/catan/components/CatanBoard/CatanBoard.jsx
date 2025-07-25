import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { defineHex, spiral, hexToPoint, createHexOrigin } from 'honeycomb-grid'
import { Hexagon } from './Hexagon'

const terrainTypes = ['forest', 'fields', 'pasture', 'hills', 'mountains', 'desert']

export default function CatanBoard() {
  const origin = createHexOrigin('topLeft', { width: 10, height: 10 })
  const Hex = defineHex({ dimensions: 1, orientation: 'pointy', origin })

  const createHex = coords => new Hex(coords)
  const spiralTraverser = spiral({ start: [0, 0], radius: 2 })

  // Get Hex instances via the traverser:
  const hexes = [...spiralTraverser(createHex)]

  const hexData = useMemo(() => {
    return hexes.map((hex, i) => ({
      hex,
      terrainType: terrainTypes[i % terrainTypes.length],
      numberToken: [6, 8].includes(i) ? 8 : i + 2,
      hasRobber: false,
      highlight: false,
    }))
  }, [hexes])

  return (
    <Canvas orthographic camera={{ position: [0, 5, 10], zoom: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />

      {hexData.map(({ hex, terrainType, numberToken, hasRobber, highlight }, idx) => {
        const { x, y } = hexToPoint(hex)
        const position = [x, 0, y]

        return (
          <Hexagon
            key={idx}
            position={position}
            terrainType={terrainType}
            numberToken={numberToken}
            hasRobber={hasRobber}
            highlight={highlight}
            onClick={() => console.log('Hex clicked:', hex.q, hex.r)}
          />
        )
      })}
    </Canvas>
  )
}

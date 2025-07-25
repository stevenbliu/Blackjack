import React, { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { defineHex, spiral, hexToPoint, createHexOrigin } from 'honeycomb-grid'
import { Hexagon } from './Hexagon'
import styles from './CatanBoard.module.css' // <-- NEW
import {typeColorMap, typeEmojiMap}  from '../../assets/temp_assets';
import {Settlement} from './Settlement'

const resourceTypeList = Object.keys(typeColorMap);

// const mockPlayers = {

// }
// const resourceTypeList = ['forest', 'fields', 'pasture', 'hills', 'mountains', 'desert']

export default function CatanBoard() {
  const [buildings, setBuildings] = useState({
    settlements: [],
    cities: [],
    roads: [],
  })

  const onClickHex = (e, hex) => {
  console.log('Hex clicked:', hex)

  setBuildings(prev => ({
    ...prev,
    settlements: [...prev.settlements, {
      position: [hex.q, hex.r],
      // playerId: currentPlayerId
    }]
  }))
}

  // Example data:
  // {
  // settlements: [{ position: [0, 0], playerId: 1 }],
  // cities: [{ position: [1, -1], playerId: 2 }],
  // roads: [{ from: [0, 0], to: [1, 0], playerId: 1 }]
  // }  

  const origin = createHexOrigin('topLeft', { width: 0, height: 0 })
  const Hex = defineHex({ dimensions: 1, orientation: 'pointy', origin })

  const createHex = coords => new Hex(coords)
  const spiralTraverser = spiral({ start: [0, 0], radius: 2 })

  // Get Hex instances via the traverser:
  const hexes = [...spiralTraverser(createHex)]

  const hexData = useMemo(() => {
    return hexes.map((hex, i) => ({
      hex,
      terrainType: resourceTypeList[i % resourceTypeList.length],
      numberToken: [6, 8].includes(i) ? 8 : i + 2,
      hasRobber: false,
      highlight: false,
    }))
  }, [hexes])

  return (
  <div className={styles.canvasWrapper}> {/* <-- NEW */}
    <Canvas orthographic camera={{ position: [0, 5, 10], zoom: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />

      {/* 1. Render Hexes */}
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
            onClick={(e) => onClickHex(e, hex)} // <--- CHANGE THIS LINE
          />
        )
      })}

      {/* 2. Render Settlements */}
      {buildings.settlements.map((settlement, idx) => {
      const hex = new Hex({ q: settlement.position[0], r: settlement.position[1] })
      const { x, y } = hexToPoint(hex)
        return (
          <Settlement
            key={`settlement-${idx}`}
            position={[x, 0.4, y]} // raised slightly above the hex
            // color={playerColors[settlement.playerId]}
            color = {'red'}
          />
        )
      })}
    </Canvas>
    </div>
  )
}



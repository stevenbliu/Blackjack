import React, { useMemo, useState } from 'react'
import { Canvas} from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei' // ✔️ This is correct

import { defineHex, spiral, hexToPoint, createHexOrigin } from 'honeycomb-grid'
import { Hexagon } from './Hexagon'
import styles from './CatanBoard.module.css' // <-- NEW
import {typeColorMap, typeEmojiMap}  from '../../assets/temp_assets';
import {Settlement} from './Settlement';
import { RenderHexes, RenderSettlements, RenderPlaceableVertices,
   getPlaceableVertexPositions, RenderPlaceableEdges, getPlaceableEdgePositions,
  RenderGridLines } from './renders';

const resourceTypeList = Object.keys(typeColorMap);

// const mockPlayers = {

// }
// const resourceTypeList = ['forest', 'fields', 'pasture', 'hills', 'mountains', 'desert']

function generateBoard(radius, resourceTypeList) {
  const origin = createHexOrigin('topLeft', { width: 0, height: 0 })
  const Hex = defineHex({ dimensions: 1, orientation: 'pointy',origin })
  // const Hex = defineHex({ dimensions: 1,origin })

  const createHex = coords => new Hex(coords)
  const spiralTraverser = spiral({ start: [0, 0], radius })

  const hexes = [...spiralTraverser(createHex)]

  const hexData = hexes.map((hex, i) => ({
    hex,
    terrainType: resourceTypeList[i % resourceTypeList.length],
    numberToken: [6, 8].includes(i) ? 8 : i + 2,
    hasRobber: false,
    highlight: false,
  }))

  return {hexData, Hex}
}

export default function CatanBoard() {
  const [buildings, setBuildings] = useState({
    settlements: [],
    cities: [],
    roads: [],
  })
    // Example data:
  // {
  // settlements: [{ position: [0, 0], playerId: 1 }],
  // cities: [{ position: [1, -1], playerId: 2 }],
  // roads: [{ from: [0, 0], to: [1, 0], playerId: 1 }]
  // }  

  const onClickHex = (e, hex) => {
    console.log('Hex clicked:', hex)

    // setBuildings(prev => ({
    //   ...prev,
    //   settlements: [...prev.settlements, {
    //     position: [hex.q, hex.r],
    //     // playerId: currentPlayerId
    //   }]
    // }))
  }

  const {hexData, Hex} = useMemo(() => generateBoard(0, resourceTypeList), [resourceTypeList]);

  const placeableEdgePositions = useMemo(() => {
    return getPlaceableEdgePositions(hexData, buildings.roads, Hex);
    }, 
    [hexData, buildings.roads, Hex]);

  console.log('placeableEdgePositions:', placeableEdgePositions);
  
  // Get all placeable settlement locations (vertex positions)
  const placeableVertexPositions = useMemo(() => {
    return getPlaceableVertexPositions(hexData, buildings.settlements, Hex);
  }, [hexData, buildings.settlements, Hex]);

  console.log('placeableVertexPositions:', placeableVertexPositions);

  return (
  <div className={styles.canvasWrapper}> {/* <-- NEW */}
    <Canvas orthographic camera={{ position: [10, 10, 10], zoom: 50 }}>
      {/* Three Canvas Settings */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <OrbitControls 
        enableZoom={true} 
        enablePan={true}
        // autoRotate 
        autoRotateSpeed={0.5} // You can adjust speed here
      />
      <RenderGridLines size={10} spacing={1}/>

      
      {/* 1. Render Hexes */}
      <RenderHexes hexData={hexData} onClickHex={onClickHex} />

      {/* 2. Render Settlements */}
      <RenderSettlements settlements={buildings.settlements} Hex={Hex} />

      {/* <RenderRoads roads={buildings.roads} Hex={Hex} /> */}

      {/* <RenderPlaceableVertices 
      positions={placeableVertexPositions} 
      onClick={(pos) => {
        console.log('Clicked to place settlement at:', pos);
        // Convert back to closest hex + vertex combo if needed
      }} /> */}

      <RenderPlaceableEdges 
      positions={placeableEdgePositions}
      onClick={(pos) => {
        console.log('Clicked to place edge at:', pos.start, pos.end);
        // Convert back to closest hex + vertex combo if needed
      }} />



    </Canvas>
    </div>
  )
}



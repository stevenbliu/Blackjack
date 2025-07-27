import React, { useEffect, useMemo, useState } from 'react'
import { Canvas} from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei' // ✔️ This is correct

import { defineHex, spiral, hexToPoint, createHexOrigin } from 'honeycomb-grid'
// import { Hexagon } from './Hexagon'
import styles from './CatanBoard.module.css' // <-- NEW
import {typeColorMap, typeEmojiMap}  from '../../assets/temp_assets';
// import {Settlement} from './Settlement';
import { RenderHexes, RenderSettlements, RenderPlaceableVertices,
   getPlaceableVertexPositions, RenderPlaceableEdges, getPlaceableEdgePositions,
  RenderGridLines, RenderBuildMenu } from './renders';
import { select } from 'three/tsl'

import {addVertexBuilding, addEdgeBuilding, handleBuild} from './BuildManager'

// import {RootState} from '@/store'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux';
import {SEND_WS_MESSAGE} from '../../../../websocket/types/actionTypes'

const resourceTypeList = Object.keys(typeColorMap);
const RADIUS = 2;

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
  // Example data:
  // {
  // settlements: [{ position: [0, 0], playerId: 1 }],
  // cities: [{ position: [1, -1], playerId: 2 }],
  // roads: [{ from: [0, 0], to: [1, 0], playerId: 1 }]
  // }
  const [buildings, setBuildings] = useState({
    settlements: [],
    cities: [],
    roads: [],
  });

  // used to receive messagesfrom websocket
  const socketMessages = useSelector((state) => state.websocket.messages);

  // send messages to websocket
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({
      type: SEND_WS_MESSAGE,
      payload: {
        type: 'build',
        payload: {
          type: 'settlement',
          position: [3.5, 0, 2.598],
          playerId: 1,
        },
      },
    });
  }, []);


  const [selectedVertex, setSelectedVertex] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // const [screenPos, setScreenPos] = useState({ x: 0, y: 0 })
  // const { camera, size } = useThree()
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (selectedVertex) {
      console.log("Selected vertex updated:", selectedVertex);

      // Trigger your building logic here, for example:
      // setBuildings((prev) => ({
      //   ...prev,
      //   settlements: [...prev.settlements, selectedVertex],
      // }))

      // Optionally clear the selection if you only want one-time activation:
      // setSelectedVertex(null)
    }
  }, [selectedVertex]);

  // type:: 'settlement' | 'city' | 'road'
  const onBuild = (type) => {
    // console.log("Building:", type, data);
    setBuildings((prevBuildings) => {
      return handleBuild(prevBuildings, {
        type: type,
        position: selectedVertex,
        playerId: 1,
      });
    });
    setSelectedVertex(null);
    setSelectedEdge(null);
  };

  const onClickHex = (e, hex) => {
    console.log("Hex clicked:", hex);

    // setBuildings(prev => ({
    //   ...prev,
    //   settlements: [...prev.settlements, {
    //     position: [hex.q, hex.r],
    //     // playerId: currentPlayerId
    //   }]
    // }))
  };

  const { hexData, Hex } = useMemo(
    () => generateBoard(RADIUS, resourceTypeList),
    [resourceTypeList]
  );

  const placeableEdgePositions = useMemo(() => {
    return getPlaceableEdgePositions(hexData, buildings.roads, Hex);
  }, [hexData, buildings.roads, Hex]);

  // console.log('placeableEdgePositions:', placeableEdgePositions);

  // Get all placeable settlement locations (vertex positions)
  const placeableVertexPositions = useMemo(() => {
    return getPlaceableVertexPositions(hexData, buildings.settlements, Hex);
  }, [hexData, buildings.settlements, Hex]);

  // console.log('placeableVertexPositions:', placeableVertexPositions);

  return (
    <div className={styles.canvasWrapper}>
      {" "}
      {/* <-- NEW */}
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
        <RenderGridLines size={10} spacing={1} />

        {/* 1. Render Hexes */}
        <RenderHexes hexData={hexData} onClickHex={onClickHex} />

        {/* 2. Render Settlements */}
        <RenderSettlements settlements={buildings.settlements} Hex={Hex} />

        {/* <RenderRoads roads={buildings.roads} Hex={Hex} /> */}

        <RenderPlaceableVertices
          positions={placeableVertexPositions}
          setSelectedVertex={setSelectedVertex}
          // onClick={(pos) => {
          //   console.log('Clicked to place settlement at:', pos);
          // }}
        />

        <RenderPlaceableEdges
          positions={placeableEdgePositions}
          onClick={(pos) => {
            console.log(
              "Clicked to place edge at:",
              pos.start,
              pos.end,
              pos.midpoint
            );
            // Convert back to closest hex + vertex combo if needed
          }}
        />

        {/* {selectedVertex && (
                <BuildMenuProjector
                  position={selectedVertex}
                  onProject={setScreenPos}
                />
              )} */}
      </Canvas>
      {selectedVertex && (
        <RenderBuildMenu
          position={selectedVertex}
          onBuild={onBuild}
          onCancel={() => setSelectedVertex(null)}
        />
      )}
    </div>
  );
}



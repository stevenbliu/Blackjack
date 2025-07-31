// RenderHexes.jsx
import React from 'react'
import { hexToPoint } from 'honeycomb-grid'
import { Hexagon } from '../Hexagon'

export function RenderHexes({ hexData, onClickHex }) {
  return hexData.map(({ hex, terrainType, numberToken, hasRobber, highlight }, idx) => {
    const { x, y } = hexToPoint(hex)
    const position = [x, 0, y]

    return (
      <Hexagon
        key={`tile-${idx}`}
        position={position}
        terrainType={terrainType}
        numberToken={numberToken}
        hasRobber={hasRobber}
        highlight={highlight}
        onClick={(e) => onClickHex(e, hex)}
      />
    )
  })
}

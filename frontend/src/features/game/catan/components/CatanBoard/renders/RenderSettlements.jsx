// RenderSettlements.jsx
import React from 'react'
import { hexToPoint } from 'honeycomb-grid'
import { Settlement } from '../Settlement'

export function RenderSettlements({ settlements, Hex }) {
  return settlements.map((settlement, idx) => {
    const hex = new Hex({ q: settlement.position[0], r: settlement.position[1] })
    const { x, y } = hexToPoint(hex)

    return (
      <Settlement
        key={`settlement-${idx}`}
        position={[x, 0.4, y]}
        color={'red'} // Replace with dynamic player color if needed
      />
    )
  })
}

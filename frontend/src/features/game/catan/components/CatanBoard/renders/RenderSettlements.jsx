// RenderSettlements.jsx
import React from 'react'
import { hexToPoint } from 'honeycomb-grid'
import { Settlement } from '../Buildings'

export function RenderSettlements({ settlements, Hex }) {
  console.log("rendering settlements", settlements);

  return settlements.map((settlement, idx) => {
    // const hex = new Hex({ q: settlement.position[0], r: settlement.position[1] })
    // const { x, y } = hexToPoint(hex)
    console.log(`Settlement ${idx}:`, settlement.position);

    return (
      <Settlement
        key={`settlement-${idx}`}
        // position={[x, 0.4, y]}
        position={settlement.position}
        color={'red'} // Replace with dynamic player color if needed
      />
    )
  })
}

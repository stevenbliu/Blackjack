// RenderRoads.jsx
import React from 'react'
import { hexToPoint } from 'honeycomb-grid'
import { Road } from '../Road' // You'll need to define this

export function RenderRoads({ roads, Hex }) {
  return roads.map((road, idx) => {
    const fromHex = new Hex({ q: road.from[0], r: road.from[1] })
    const toHex = new Hex({ q: road.to[0], r: road.to[1] })

    const from = hexToPoint(fromHex)
    const to = hexToPoint(toHex)

    return (
      <Road
        key={`road-${idx}`}
        from={[from.x, 0.1, from.y]}
        to={[to.x, 0.1, to.y]}
        color={'gray'} // Replace with dynamic player color if needed
      />
    )
  })
}

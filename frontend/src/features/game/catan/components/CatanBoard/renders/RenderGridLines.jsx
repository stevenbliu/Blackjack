// GridLines.jsx
import React from 'react'
import { Line, Text, Billboard } from '@react-three/drei'

export function RenderGridLines({ size = 5, spacing = 1 }) {
  const lines = []

  // === Major colored axes ===
  lines.push({
    key: 'axis-x',
    points: [[-size, 0, 0], [size, 0, 0]],
    color: 'red',
    labelPos: [size + 0.5, 0, 0],
    label: 'X',
  })

  lines.push({
    key: 'axis-y',
    points: [[0, -size, 0], [0, size, 0]],
    color: 'green',
    labelPos: [0, size + 0.5, 0],
    label: 'Y',
  })

  lines.push({
    key: 'axis-z',
    points: [[0, 0, -size], [0, 0, size]],
    color: 'blue',
    labelPos: [0, 0, size + 0.5],
    // label: 'Z',
  })

  // === Optional gray grid (XZ plane) ===
  for (let z = -size; z <= size; z += spacing) {
    lines.push({
      key: `grid-xz-hz-${z}`,
      points: [
        [-size, 0, z],
        [size, 0, z]
      ],
      color: 'gray',
      opacity: 0.3,
    })
  }

  for (let x = -size; x <= size; x += spacing) {
    lines.push({
      key: `grid-xz-vt-${x}`,
      points: [
        [x, 0, -size],
        [x, 0, size]
      ],
      color: 'gray',
      opacity: 0.3,
    })
  }

  for (let y = -size; y <= size; y += spacing) {
    lines.push({
      key: `grid-xy-vt-${y}`,
      points: [
        [0, y, -size],
        [0, y, size]
      ],
      color: 'gray',
      opacity: 0.3,
    })
  }

  return (
    <>
      {lines.map(({ key, points, color, labelPos, label, opacity = 1 }) => (
        <React.Fragment key={key}>
          <Line
            points={points}
            color={color}
            lineWidth={label ? 4 : 2}
            transparent
            opacity={opacity}
            depthWrite={false}
          />
          {/* Draw spheres at line ends for major axes */}
          {label && (
            <>
              <mesh position={points[0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
              </mesh>
              <mesh position={points[1]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
              </mesh>

              {/* Axis label */}
              <Billboard>
                <Text
                  position={labelPos}
                  fontSize={0.7}
                  color={color}
                  outlineWidth={0.02}
                  outlineColor="white"
                  anchorX="center"
                  anchorY="middle"
                  depthTest={false}
                >
                  {label}
                </Text>
              </Billboard>
            </>
          )}
        </React.Fragment>
      ))}
    </>
  )
}

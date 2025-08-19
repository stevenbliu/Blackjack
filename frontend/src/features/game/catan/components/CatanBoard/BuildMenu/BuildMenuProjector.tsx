// // BuildMenuProjector.tsx
// import { useEffect } from 'react'
// import { useThree } from '@react-three/fiber'
// import { Vector3 } from 'three'

// export function BuildMenuProjector({ position, onProject }) {
//   const { camera, size } = useThree()

//   useEffect(() => {
//     if (!position) return

//     const worldPos = new Vector3(...position)
//     worldPos.project(camera)

//     const x = (worldPos.x * 0.5 + 0.5) * size.width
//     const y = (-worldPos.y * 0.5 + 0.5) * size.height

//     onProject({ x, y })
//   }, [position, camera, size, onProject])

//   return null
// }

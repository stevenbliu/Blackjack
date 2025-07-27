// components/RenderBuildMenu.tsx
import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import BuildMenu from '../BuildMenu/BuildMenu'

export function RenderBuildMenu({onBuild, onCancel }) {
  console.log("RenderBuildMenu");

  // if (!screenPos || screenPos.x == null || screenPos.y == null) {
  //   console.log("RenderBuildMenu: screenPos is null");
  //   return null // or return a loading spinner or placeholder
  // }

  return <BuildMenu onBuild={onBuild} onCancel={() => onCancel(null)} />;
}



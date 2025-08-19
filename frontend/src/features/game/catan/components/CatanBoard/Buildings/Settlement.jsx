// import { useMemo, useEffect } from 'react'
// import { useGLTF } from '@react-three/drei'
// '../../assets/GlTF_models/Building_1/Phase_1/Building_1_phase_1.glb'

export function Settlement({ position, color }) {
  // Optionally memoize colors/materials for performance
  const baseColor = color || "orange";
  const roofColor = "firebrick";
  // const model_path = "/GlTF_models/Building_1/Phase_1/Building_1_phase_1.glb";
  // const { scene } = useGLTF(model_path);
  
  // // Clone the scene for this instance
  // const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // // Update material color on the cloned scene
  // useEffect(() => {
  //   clonedScene.traverse((child) => {
  //     if (child.isMesh && child.material) {
  //       child.material = child.material.clone(); // clone material so changes are local
  //       child.material.color.set(color);
  //       child.material.needsUpdate = true;
  //     }
  //   });
  // }, [clonedScene, color]);

  return (
    // <primitive object={scene} position={position} scale={0.1} />

    <group position={position}>
      {/* Base of the house */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={baseColor} />
      </mesh>

    //   {/* Roof as a pyramid */}
    //   <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 4, 0, 0]}>
    //     <coneGeometry args={[0.3, 0.3, 4]} />
    //     <meshStandardMaterial color={roofColor} />
    //   </mesh>
    // </group>
  );
}

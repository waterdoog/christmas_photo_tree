import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TREE_CONFIG, DisplayMode } from '../types';
import * as THREE from 'three';

interface StarTopperProps {
  mode: DisplayMode;
}

export const StarTopper: React.FC<StarTopperProps> = ({ mode }) => {
  const ref = useRef<THREE.Group>(null);
  
  // Height is roughly half of total height (since centered at 0)
  const treeHeightY = TREE_CONFIG.height / 2 + 0.5; 

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Rotate the star
    ref.current.rotation.y += delta;
    
    // Move logic
    const targetY = mode === 'TREE' ? treeHeightY : 0;
    const targetScale = mode === 'TREE' ? 1 : 0.01; // Hide star in dispersed mode effectively
    
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, delta * 2);
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 2);
  });

  return (
    <group ref={ref} position={[0, treeHeightY, 0]}>
      <mesh>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={2} 
            toneMapped={false}
        />
      </mesh>
      <pointLight color="#FFD700" intensity={2} distance={10} decay={2} />
    </group>
  );
};

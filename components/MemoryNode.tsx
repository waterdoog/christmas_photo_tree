import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Text } from '@react-three/drei';
import * as THREE from 'three';
import { PhotoData, DisplayMode } from '../types';
import { getTreePosition, getDispersedPosition, getRandomRotation } from '../utils/math';

interface MemoryNodeProps {
  data: PhotoData;
  index: number;
  total: number;
  mode: DisplayMode;
}

export const MemoryNode: React.FC<MemoryNodeProps> = ({ data, index, total, mode }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Precompute targets for both modes to keep it deterministic
  const treePos = useMemo(() => getTreePosition(index, total), [index, total]);
  const dispersedPos = useMemo(() => getDispersedPosition(10), []);
  
  const randomRot = useMemo(() => getRandomRotation(), []);
  
  // Smooth animation logic
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const targetPos = mode === 'TREE' ? treePos : dispersedPos;
    
    // Lerp position
    groupRef.current.position.lerp(targetPos, 2.5 * delta);
    
    // Lerp rotation: In tree mode, face outwards roughly, in dispersed, tumble slightly
    if (mode === 'TREE') {
        // Calculate lookAt target (center spine of tree, but maintain uprightness)
        const currentPos = groupRef.current.position;
        const angle = Math.atan2(currentPos.x, currentPos.z);
        const targetRotY = angle + Math.PI; // Face out
        
        // Softly interpolate rotation
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 2);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 2);
        
        // Quaternion slerp would be better but Euler lerp is enough for simple Y axis
        // We manually animate Y towards target
        const diff = targetRotY - groupRef.current.rotation.y;
        // Normalize angle
        let normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
        groupRef.current.rotation.y += normalizedDiff * delta * 2;

    } else {
        // Drifting rotation in space
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, randomRot.x, delta);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, randomRot.y, delta);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, randomRot.z, delta);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Polaroid Frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial 
          color="#fdfdfd" 
          roughness={0.2} 
          metalness={0.1}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* The Photo */}
      <Image 
        url={data.url} 
        transparent 
        position={[0, 0.15, 0.01]}
        scale={[1, 1]}
      />
      
      {/* Back of the card (Gold) */}
      <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
         <planeGeometry args={[1.2, 1.5]} />
         <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

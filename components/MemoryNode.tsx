import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Text } from '@react-three/drei';
import * as THREE from 'three';
import { PhotoData, DisplayMode } from '../types';
import { getTreePosition, getDispersedPosition, getRandomRotation, getTreeRotation } from '../utils/math';

interface MemoryNodeProps {
  data: PhotoData;
  index: number;
  total: number;
  mode: DisplayMode;
  onClick?: (data: PhotoData) => void;
}

export const MemoryNode: React.FC<MemoryNodeProps> = ({ data, index, total, mode, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Precompute targets for both modes to keep it deterministic
  const treePos = useMemo(() => getTreePosition(index, total), [index, total]);
  const treeRot = useMemo(() => getTreeRotation(treePos), [treePos]);
  
  const dispersedPos = useMemo(() => getDispersedPosition(12), []);
  const randomRot = useMemo(() => getRandomRotation(), []);
  
  // Smooth animation logic
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const targetPos = mode === 'TREE' ? treePos : dispersedPos;
    
    // Lerp position
    groupRef.current.position.lerp(targetPos, 2.5 * delta);
    
    // Lerp rotation
    if (mode === 'TREE') {
        // Face Outwards logic
        // We use quaternion slerp for smoothness or simple Euler lerp
        // Angle (treeRot.y) faces OUT from center.
        
        // Softly interpolate rotation
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 2);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 2);
        
        // Handle Y rotation wrap-around
        let targetY = treeRot.y;
        const currentY = groupRef.current.rotation.y;
        
        // Shortest path interpolation
        const diff = targetY - currentY;
        const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
        
        groupRef.current.rotation.y += normalizedDiff * delta * 2;

    } else {
        // Drifting rotation in space
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, randomRot.x, delta);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, randomRot.y, delta);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, randomRot.z, delta);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) onClick(data);
  };

  return (
    <group ref={groupRef} onClick={handleClick} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'default'; }}>
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
      
      {/* The Photo - Facing +Z relative to group */}
      <Image 
        url={data.url} 
        transparent 
        position={[0, 0.15, 0.01]}
        scale={[1, 1]}
      />
      
      {/* Caption text on bottom gray border */}
      {data.caption && (
        <>
          {/* Gray background for caption */}
          <mesh position={[0, -0.6, 0.015]}>
            <planeGeometry args={[1.1, 0.15]} />
            <meshBasicMaterial color="#e5e5e5" transparent opacity={0.9} />
          </mesh>
          {/* Caption text - white text on gray background */}
          <Text
            position={[0, -0.6, 0.02]}
            fontSize={0.06}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.0}
            textAlign="center"
          >
            {data.caption}
          </Text>
        </>
      )}
      
      {/* Back of the card (Gold) */}
      <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
         <planeGeometry args={[1.2, 1.5]} />
         <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};
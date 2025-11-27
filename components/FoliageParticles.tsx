import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DisplayMode, TREE_CONFIG } from '../types';
import { getTreePosition, getDispersedPosition } from '../utils/math';

interface FoliageParticlesProps {
  mode: DisplayMode;
}

export const FoliageParticles: React.FC<FoliageParticlesProps> = ({ mode }) => {
  const count = TREE_CONFIG.particleCount;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lightRef = useRef<THREE.InstancedMesh>(null);
  
  // Store target positions
  const treePositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Use the new Volumetric getTreePosition
      // It already includes organic randomness (jitter) via pseudo-random radius
      const pos = getTreePosition(i, count);
      
      arr[i * 3] = pos.x;
      arr[i * 3 + 1] = pos.y;
      arr[i * 3 + 2] = pos.z;
    }
    return arr;
  }, [count]);

  const dispersedPositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const pos = getDispersedPosition(14); // Wider dispersion
      arr[i * 3] = pos.x;
      arr[i * 3 + 1] = pos.y;
      arr[i * 3 + 2] = pos.z;
    }
    return arr;
  }, [count]);

  // Temp object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Current positions state (we need to interpolate manually for instanced mesh)
  const currentPositions = useRef(new Float32Array(count * 3));
  
  // Initialize positions
  useLayoutEffect(() => {
    // Start at tree positions
    currentPositions.current.set(treePositions);
  }, [treePositions]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetBuffer = mode === 'TREE' ? treePositions : dispersedPositions;
    const speed = 2.0 * delta;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Lerp current to target
      currentPositions.current[ix] += (targetBuffer[ix] - currentPositions.current[ix]) * speed;
      currentPositions.current[iy] += (targetBuffer[iy] - currentPositions.current[iy]) * speed;
      currentPositions.current[iz] += (targetBuffer[iz] - currentPositions.current[iz]) * speed;

      dummy.position.set(
        currentPositions.current[ix],
        currentPositions.current[iy],
        currentPositions.current[iz]
      );
      
      // Rotate particles slightly over time
      dummy.rotation.set(
        Math.sin(state.clock.elapsedTime * 0.5 + i),
        Math.cos(state.clock.elapsedTime * 0.3 + i),
        0
      );

      // Scale pulse
      const scale = 0.05 + Math.sin(state.clock.elapsedTime * 2 + i * 10) * 0.02;
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      // Update light dots (fewer, every 10th particle)
      if (lightRef.current && i % 10 === 0) {
         const lightIndex = i / 10;
         dummy.scale.set(scale * 1.5, scale * 1.5, scale * 1.5);
         dummy.updateMatrix();
         lightRef.current.setMatrixAt(lightIndex, dummy.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (lightRef.current) lightRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* The Emerald Needles */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#064e3b"
          emissiveIntensity={0.5}
          roughness={0.4}
          metalness={0.6}
          toneMapped={false}
        />
      </instancedMesh>

      {/* The Golden Lights */}
      <instancedMesh ref={lightRef} args={[undefined, undefined, Math.floor(count / 10)]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#FFD700" toneMapped={false} />
      </instancedMesh>
    </group>
  );
};
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
// Import proper OrbitControls types
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { PhotoData, DisplayMode } from '../types';
import { MemoryNode } from './MemoryNode';
import { FoliageParticles } from './FoliageParticles';
import { StarTopper } from './StarTopper';

interface ExperienceProps {
  photos: PhotoData[];
  mode: DisplayMode;
  rotationInputRef: React.MutableRefObject<number>;
  onPhotoClick?: (photo: PhotoData) => void;
}

// Wrapper to handle frame updates for controls
const SceneController = ({ mode, rotationInputRef }: { mode: DisplayMode, rotationInputRef: React.MutableRefObject<number> }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  
  useFrame((state, delta) => {
    if (controlsRef.current) {
      // Base idle speed
      const baseSpeed = mode === 'TREE' ? 0.5 : 0.2;
      
      // Get hand input (-5 to 5 roughly)
      const input = rotationInputRef.current;
      
      // If there is significant input, boost speed. Otherwise decay to base.
      // We want to smoothly interpolate current speed to target
      // Target is base + input * multiplier
      
      const targetSpeed = baseSpeed + (input * 20); // Sensitivity multiplier
      
      // Smooth lerp
      controlsRef.current.autoRotateSpeed = THREE.MathUtils.lerp(
        controlsRef.current.autoRotateSpeed, 
        targetSpeed, 
        delta * 5
      );
    }
  });

  return (
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.5}
        maxDistance={30}
        minDistance={5}
        autoRotate={true} // Always auto rotate, we control speed
        autoRotateSpeed={0.5} // Initial value
      />
  );
}

export const Experience: React.FC<ExperienceProps> = ({ photos, mode, rotationInputRef, onPhotoClick }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 18], fov: 45 }}
      gl={{ antialias: false, alpha: false }}
    >
      <color attach="background" args={['#010b07']} />
      
      {/* Environmental Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#004d40" />

      {/* Main Content */}
      <group position={[0, -1, 0]}>
        <StarTopper mode={mode} />
        
        <FoliageParticles mode={mode} />
        
        {/* Render Photos */}
        {photos.map((photo, index) => (
          <MemoryNode 
            key={photo.id} 
            data={photo} 
            index={index} 
            total={photos.length} 
            mode={mode}
            onClick={onPhotoClick}
          />
        ))}
      </group>

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={20} size={4} speed={0.4} opacity={0.5} color="#fbbf24" />

      {/* Controls Logic */}
      <SceneController mode={mode} rotationInputRef={rotationInputRef} />

      {/* Post Processing for Cinematic Look */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { PhotoData, DisplayMode } from '../types';
import { MemoryNode } from './MemoryNode';
import { FoliageParticles } from './FoliageParticles';
import { StarTopper } from './StarTopper';

interface ExperienceProps {
  photos: PhotoData[];
  mode: DisplayMode;
}

export const Experience: React.FC<ExperienceProps> = ({ photos, mode }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 18], fov: 45 }}
      gl={{ antialias: false, alpha: false }}
    >
      <color attach="background" args={['#010b07']} />
      
      {/* Environmental Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#emerald" />
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
          />
        ))}
      </group>

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={20} size={4} speed={0.4} opacity={0.5} color="#fbbf24" />

      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.5}
        maxDistance={30}
        minDistance={5}
        autoRotate={mode === 'TREE'}
        autoRotateSpeed={0.5}
      />

      {/* Post Processing for Cinematic Look */}
      <EffectComposer disableNormalPass>
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

import * as THREE from 'three';
import { TREE_CONFIG } from '../types';

/**
 * Calculates a position inside a Volumetric Cone using Golden Angle (Phyllotaxis)
 * This fills the center of the tree, not just the surface.
 */
export const getTreePosition = (index: number, total: number): THREE.Vector3 => {
  // Normalized height (0 at bottom, 1 at top)
  // We bias slightly towards bottom for fuller look: Math.pow(ratio, 0.8)
  const ratio = index / total;
  const heightProgress = ratio; 
  
  const y = heightProgress * TREE_CONFIG.height; 
  
  // Maximum radius at this height (Cone shape)
  const maxRadiusAtHeight = TREE_CONFIG.radiusBottom * (1 - heightProgress);
  
  // Golden Angle for organic distribution without visible lines
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.3999 radians
  const theta = index * goldenAngle;
  
  // Random radius distribution to fill volume
  // sqrt(random) gives uniform distribution in a circle disc area
  // We use a deterministic pseudo-random based on index to keep positions stable across renders
  const pseudoRandom = (Math.sin(index * 12.9898) * 43758.5453) % 1;
  const r = maxRadiusAtHeight * Math.sqrt(Math.abs(pseudoRandom));

  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);
  
  // Center the tree vertically
  return new THREE.Vector3(x, y - TREE_CONFIG.height / 2, z);
};

/**
 * Calculates the rotation for an item on the tree to face OUTWARDS
 */
export const getTreeRotation = (position: THREE.Vector3): THREE.Euler => {
  // Calculate angle from center (0,0) to position (x,z)
  const angle = Math.atan2(position.x, position.z);
  
  // 0 rotation usually faces +Z. 
  // We want the plane to face the vector (x,z).
  // Standard LookAt behavior.
  return new THREE.Euler(0, angle, 0);
};

/**
 * Calculates a random position inside a sphere (Dispersed mode)
 */
export const getDispersedPosition = (radius: number = 10): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

/**
 * Helper to get random rotation
 */
export const getRandomRotation = (): THREE.Euler => {
  return new THREE.Euler(
    Math.random() * 0.5 - 0.25,
    Math.random() * Math.PI * 2,
    Math.random() * 0.5 - 0.25
  );
};
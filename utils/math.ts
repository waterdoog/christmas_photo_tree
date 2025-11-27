import * as THREE from 'three';
import { TREE_CONFIG } from '../types';

/**
 * Calculates a position on a spiral cone (The Tree)
 */
export const getTreePosition = (index: number, total: number): THREE.Vector3 => {
  const y = (index / total) * TREE_CONFIG.height; // Height from 0 to max
  const progress = index / total; // 0 to 1
  
  // Radius gets smaller as we go up
  const radius = TREE_CONFIG.radiusBottom * (1 - progress);
  
  // Spiral angle
  const angle = progress * Math.PI * 2 * TREE_CONFIG.spiralTurns;

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  // Center the tree vertically
  return new THREE.Vector3(x, y - TREE_CONFIG.height / 2, z);
};

/**
 * Calculates a random position inside a sphere (Dispersed mode)
 */
export const getDispersedPosition = (radius: number = 8): THREE.Vector3 => {
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

import * as THREE from 'three';

export type DisplayMode = 'TREE' | 'DISPERSED';

export interface PhotoData {
  id: string;
  url: string;
  aspectRatio: number;
}

// Configuration constants
export const TREE_CONFIG = {
  height: 12,
  radiusBottom: 4.5,
  spiralTurns: 4,
  particleCount: 1500, // For the "needles"
};
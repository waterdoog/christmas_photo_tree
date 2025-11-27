export type DisplayMode = 'TREE' | 'DISPERSED';

export interface PhotoData {
  id: string;
  url: string;
  aspectRatio: number;
}

// Configuration constants
export const TREE_CONFIG = {
  height: 14, // Taller
  radiusBottom: 6.5, // Wider base
  spiralTurns: 8, // More turns for density
  particleCount: 2500, // Much higher count for "Needles"
};
import * as THREE from 'three';
import { Object3DNode, BufferGeometryNode, MaterialNode } from '@react-three/fiber';

// Augment the global JSX namespace to include Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: Object3DNode<THREE.Group, typeof THREE.Group>;
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      instancedMesh: Object3DNode<THREE.InstancedMesh, typeof THREE.InstancedMesh>;
      pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
      ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      
      planeGeometry: BufferGeometryNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
      boxGeometry: BufferGeometryNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
      sphereGeometry: BufferGeometryNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>;
      octahedronGeometry: BufferGeometryNode<THREE.OctahedronGeometry, typeof THREE.OctahedronGeometry>;
      
      meshStandardMaterial: MaterialNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>;
      meshBasicMaterial: MaterialNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>;
      
      color: any;
    }
  }
}

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
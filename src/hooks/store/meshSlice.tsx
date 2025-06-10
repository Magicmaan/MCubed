// functions to modify mesh
import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CubeProps, THREETextureProps } from '../../types/three';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
export type MeshSlice = {
	name: string;
	id: string;

	mesh: THREE.Group<THREE.Object3DEventMap>;
	textures: THREE.Texture[];

	cubeCount: number;
	textureCount: number;
};

const createMeshSlice: StateCreator<MeshSlice, [], [], MeshSlice> = (set) => ({
	name: 'Mesh',
	id: uuidv4(),
	mesh: new THREE.Group(),
	textures: [],

	cubeCount: 0,
	textureCount: 0,
});

export default createMeshSlice;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Box } from '@react-three/drei'; // Adjust the import path as necessary
import { BoxUVMap, createTexture, loadTexture } from '../util/textureUtil';
import * as THREE from 'three';
import Cube, { GroupProps } from '../components/ThreeComponents/Cube';
import { getBase64 } from '../util/baseSFUtil';
import { THREETextureProps } from '../types/three';
import { CubeProps } from '../types/three';

type MeshState = {
	name: string;
	mesh: CubeProps[];
	texture: THREETextureProps[];
	cubeCount: number;
	textureCount: number;
};

type MeshStateSerialised = {
	name: string;
	mesh: CubeProps[];
	texture: THREETextureProps[];
	cubeCount: number;
	textureCount: number;

	creationDate: string;
	lastModified: string;
};

const cubeCount = 1;

const o1 = 1 / 8;

const UVo = {
	top: [o1, 0, o1 * 2, o1],
	bottom: [o1 * 2, 0, o1 * 3, o1],

	right: [o1, o1, o1 * 2, o1 * 2],
	front: [o1 * 3, o1, o1 * 4, o1 * 2],
	back: [o1 * 2, o1, o1 * 3, o1 * 2],
	left: [0, o1, o1, o1 * 2],
};
console.log('Sample UV', UVo);
const meshInitialState: MeshState = {
	name: 'default',
	cubeCount: 0,
	textureCount: 1,
	mesh: [
		// {
		// 	type: 'Cube',
		// 	name: 'Cube_1',
		// 	colour: '#2f00ff',
		// 	size: [16, 32, 16],
		// 	position: [0, 0, 0],
		// 	rotation: [0, 0, 0],
		// 	pivot: [0, 0, 0],
		// 	scale: 1,
		// 	props: [],
		// 	id: 0,
		// 	// uv: UVo as any,
		// 	uv: new BoxUVMap({
		// 		width: 1,
		// 		height: 1,
		// 		depth: 1,
		// 	}).toUVMap(128, 128) as any,
		// },
		// {
		// 	type: 'Cube',
		// 	name: 'Cube_2',
		// 	colour: '#ff0000',
		// 	size: [16, 16, 16],
		// 	position: [16, 16, 0],
		// 	rotation: [0, 0, 0],
		// 	pivot: [0, 0, 0],
		// 	scale: 1,
		// 	props: [],
		// 	id: 1,
		// 	uv: new BoxUVMap({
		// 		width: 1,
		// 		height: 1,
		// 		depth: 1,
		// 	}).toUVMap(128, 128) as any,
		// },
	],
	texture: [
		{
			name: 'test',
			data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAbUExURf///yQiMhcVIg0MFuTAXPHPdbZvItWsQsmMNMmMu0YAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAENSURBVGje7ZQxjoNAEAT5gvkBJrBjBi2TI/kDlnz57Qk2PnRnYlbCPNt2MMlEbuKupKJpbbCqwjiUdds31cFcoLzubuPr0gwPVO1VY9eXZnig/ZKQ5dGb8YE5a9b7ZN4xkLrpsU1meOCU1/GSdDHjAxL+hii/5h0D3WXoZTHDA+e4/f/MYTHjL0hjiOuwmPEXrDFkTd9meEBX0Sgpm+EB0fcHymKGB6q6m7epKc3wQHmsNTfHyvzxoe8A3AXfAbgLvgNwF3wH4C74DsBd8B2Au+A7AHfBdwDugu8A3AXfAbgLvgNwF3wH4C74DsBd8B2Au+A7AHfBd2B3FwghhBBCCCGEEEIIIYQQQj6iKJ6VAumzIuHGAwAAAABJRU5ErkJggg==',
			path: 'test',
			local_path: 'test',
			width: 128,
			height: 128,
			active: true,
			id: 0,
		},
	],
};

// functions to modify mesh
const meshSlice = createSlice({
	name: 'mesh',
	initialState: meshInitialState,
	reducers: {
		meshAddCube(state) {
			state.mesh.push({
				type: 'Cube',
				name: 'Cube_' + (state.cubeCount + 1),
				colour: '#ff0000',
				size: [16, 16, 16],
				position: [0, 0, 0],
				rotation: [0, 0, 0],
				pivot: [0, 0, 0],
				scale: 1,
				props: [],
				id: state.cubeCount,
				auto_uv: true,
				uv: new BoxUVMap({
					width: 16,
					height: 16,
					depth: 16,
				})
					.setPosition(1, 1)
					.toUVMap(128, 128) as any,
			});
			state.cubeCount++;
		},
		meshRemoveCube(state, action: PayloadAction<{ id: number }>) {
			const index = state.mesh.findIndex(
				(item) => item.id === action.payload.id
			);
			if (index !== -1) {
				state.mesh.splice(index, 1);
			}
		},

		meshModify(
			state,
			action: PayloadAction<{
				id: number;
				position?: [number, number, number];
				rotation?: [number, number, number];
				scale?: number;
				pivot?: [number, number, number];
				colour?: string;
				size?: [number, number, number];
				uv?: {
					top: [number, number, number, number];
					bottom: [number, number, number, number];
					left: [number, number, number, number];
					right: [number, number, number, number];
					front: [number, number, number, number];
					back: [number, number, number, number];
				};
			}>
		) {
			const index = state.mesh.findIndex(
				(item) => item.id === action.payload.id
			);
			if (index !== -1) {
				const mesh = state.mesh[index];
				if (action.payload.position) {
					mesh.position = action.payload.position;
				}
				if (action.payload.rotation) {
					mesh.rotation = action.payload.rotation;
				}
				if (action.payload.scale) {
					mesh.scale = action.payload.scale;
				}
				if (action.payload.size) {
					mesh.size = action.payload.size;

					// update UV
					if (mesh.auto_uv) {
						mesh.uv = new BoxUVMap({
							width: mesh.size[0],
							height: mesh.size[1],
							depth: mesh.size[2],
						})
							.setPosition(1, 1)
							.toUVMap(128, 128) as any;
					}
				}
				if (action.payload.uv) {
					state.mesh[index].uv = action.payload.uv;
				}
			}
		},
		meshModifyIndex(
			state,
			action: PayloadAction<{
				index: number;
				position?: [number, number, number];
				rotation?: [number, number, number];
				scale?: number;
				pivot?: [number, number, number];
				colour?: string;
				size?: [number, number, number];
				uv?: {
					top: [number, number, number, number];
					bottom: [number, number, number, number];
					left: [number, number, number, number];
					right: [number, number, number, number];
					front: [number, number, number, number];
					back: [number, number, number, number];
				};
			}>
		) {
			if (action.payload.position) {
				state.mesh[action.payload.index].position =
					action.payload.position;
			}
			if (action.payload.rotation) {
				state.mesh[action.payload.index].rotation =
					action.payload.rotation;
			}
			if (action.payload.scale) {
				state.mesh[action.payload.index].scale = action.payload.scale;
			}
			if (action.payload.size) {
				state.mesh[action.payload.index].size = action.payload.size;
			}
			if (action.payload.uv) {
				state.mesh[action.payload.index].uv = action.payload.uv;
			}
			const afterTime = new Date().toISOString();
			console.log('After modification at', afterTime);
		},
	},
});

//export const { actions, reducer } = someSlice;
//export default someSlice.reducer;
export default meshSlice;
export const { meshModify, meshModifyIndex, meshAddCube, meshRemoveCube } =
	meshSlice.actions;

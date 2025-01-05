import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Box } from '@react-three/drei'; // Adjust the import path as necessary
import { BoxUVMap, createTexture, loadTexture } from '../util/textureUtil';
import * as THREE from 'three';
import Cube, {
	CubeProps,
	GroupProps,
	THREEObjectProps,
} from '../components/ThreeComponents/Cube';
import { getBase64 } from '../util/baseSFUtil';

type THREETextureProps = {
	name: string;
	data: string;
	path: string;
	local_path: string;

	width: number;
	height: number;

	active: boolean;
	id: number;
};

type MeshState = {
	mesh: THREEObjectProps[];
	texture: THREETextureProps[];
	cubeCount: number;
	textureCount: number;
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
	cubeCount: cubeCount,
	textureCount: 1,
	mesh: [
		{
			type: 'Cube',
			name: 'Cube_' + cubeCount,
			colour: '#2f00ff',
			size: [16, 32, 16],
			position: [0, 0, 0],
			rotation: [0, 0, 0],
			pivot: [0, 0, 0],
			scale: 1,
			props: [],
			id: cubeCount - 1,
			// uv: UVo as any,
			uv: new BoxUVMap({
				width: 1,
				height: 1,
				depth: 1,
			}).toUVMap(128, 128) as any,
		},
		{
			type: 'Cube',
			name: 'Cube_' + (cubeCount + 1),
			colour: '#ff0000',
			size: [16, 16, 16],
			position: [16, 16, 0],
			rotation: [0, 0, 0],
			pivot: [0, 0, 0],
			scale: 1,
			props: [],
			id: cubeCount,
			uv: new BoxUVMap({
				width: 1,
				height: 1,
				depth: 1,
			}).toUVMap(128, 128) as any,
		},
		{
			type: 'Cube',
			name: 'Cube_' + (cubeCount + 2),
			colour: '#00ff00',
			size: [16, 16, 16],
			position: [-16, -16, 0],
			rotation: [0, 0, 0],
			pivot: [0, 0, 0],
			scale: 1,
			props: [],
			id: cubeCount + 1,
			uv: new BoxUVMap({
				width: 1,
				height: 1,
				depth: 1,
			}).toUVMap(128, 128) as any,
		},
		// {
		// 	type: 'Cube',
		// 	name: 'Cube_' + cubeCount,
		// 	colour: '#2f00ff',
		// 	size: [16, 16, 16],
		// 	position: [16, 16, 0],
		// 	rotation: [0, 0, 0],
		// 	pivot: [0, 0, 0],
		// 	scale: 1,
		// 	props: [],
		// 	id: cubeCount - 1,
		// 	// uv: UVo as any,
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
		meshAddRandom(state) {
			state.mesh[0].children.push({
				name: 'Cube_' + state.cubeCount,
				colour: '#0004ff',
				size: [16, 16, 16],
				pos: [
					Math.random() * 10,
					Math.random() * 10,
					Math.random() * 10,
				],
				rot: [0, 0, 0],
				piv: [0, 0, 0],
				scale: 1,
				id: state.cubeCount,
			});
			state.cubeCount++;
			console.log('Added cube from reducer');
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
				if (action.payload.position) {
					state.mesh[index].position = action.payload.position;
				}
				if (action.payload.rotation) {
					state.mesh[index].rotation = action.payload.rotation;
				}
				if (action.payload.scale) {
					state.mesh[index].scale = action.payload.scale;
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
			state.mesh[action.payload.index].colour = action.payload.colour;
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
export const { meshAddRandom, meshModify, meshModifyIndex } = meshSlice.actions;

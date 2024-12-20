import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Box } from "@react-three/drei"; // Adjust the import path as necessary
import { createTexture } from "../util/textureUtil";
import * as THREE from "three";
import Cube, {
	CubeMesh,
	CubeProps,
	GroupProps,
	THREEObjectProps,
} from "../primitives/Cube";

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
const meshInitialState: MeshState = {
	cubeCount: cubeCount,
	textureCount: 0,
	mesh: [
		{
			type: "Cube",
			name: "Cube_" + cubeCount,
			colour: "#2f00ff",
			size: [8, 16, 16],
			position: [16, 0, 0],
			rotation: [0, 0, 0],
			pivot: [0, 0, 0],
			scale: 1,
			props: [],
			id: cubeCount - 1,
			uv: {
				top: [0, 0, 1 / 16, 1 / 8],
				bottom: [0, 0, 1 / 16, 1 / 8],
				left: [0, 0, 1 / 16, 1 / 8],
				right: [0, 0, 1 / 16, 1 / 8],
				front: [0, 0, 1 / 8, 1 / 8],
				back: [0, 0, 1 / 8, 1 / 8],
			},
		},
		{
			type: "Cube",
			name: "Cube_2",
			colour: "#ff0000",
			size: [16, 16, 16],
			position: [10, 10, 10],
			rotation: [0, 0, 0],
			pivot: [0, 0, 0],
			scale: 1,
			uv: {
				top: [0, 0, 1, 1],
				bottom: [0, 0, 1, 1],
				left: [0, 0, 1, 1],
				right: [0, 0, 1, 1],
				front: [0, 0, 1, 1],
				back: [0, 0, 1, 1],
			},
			props: [],
			id: cubeCount,
		},
	],
	texture: [
		{
			name: "test",
			data: "test",
			path: "test",
			local_path: "test",
			width: 16,
			height: 16,
			active: true,
			id: 0,
		},
	],
};

const meshSlice = createSlice({
	name: "mesh",
	initialState: meshInitialState,
	reducers: {
		meshAddRandom(state) {
			state.mesh[0].children.push({
				name: "Cube_" + state.cubeCount,
				colour: "#0004ff",
				size: [16, 16, 16],
				pos: [Math.random() * 10, Math.random() * 10, Math.random() * 10],
				rot: [0, 0, 0],
				piv: [0, 0, 0],
				scale: 1,
				id: state.cubeCount,
			});
			state.cubeCount++;
			console.log("Added cube from reducer");
		},
		testReducer(state) {
			console.log("Test reducer");
		},
		meshModify(state, action: PayloadAction<number>) {
			const index = state.mesh.findIndex((item) => item.id === action.payload);
			if (index !== -1) {
				state.mesh[index].colour = "red";
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
			}>
		) {
			console.log("Mesh modify index");
			console.log(action.payload);
			state.mesh[action.payload.index].colour = action.payload.colour;
			if (action.payload.position) {
				state.mesh[action.payload.index].position = action.payload.position;
			}
			if (action.payload.rotation) {
				state.mesh[action.payload.index].rotation = action.payload.rotation;
			}

			//state.mesh[action.payload.index].colour = "red";
		},
		// meshAdd(state, action: PayloadAction<typeof Box>) {
		// 	// Action = CubeMesh
		// 	state.mesh.push(action.payload);
		// },
		// Define your reducers here
	},
});

//export const { actions, reducer } = someSlice;
//export default someSlice.reducer;
export default meshSlice;
export const { meshAddRandom, testReducer, meshModify, meshModifyIndex } =
	meshSlice.actions;

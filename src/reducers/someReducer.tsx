import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Box } from "@react-three/drei"; // Adjust the import path as necessary
import { createTexture } from "../util/textureUtil";
import * as THREE from "three";
import { CubeMesh } from "../primitives/Cube";

type MeshState = {
	meshArray: Array<React.ReactNode>;
	cubeCount: number;
};
const meshInitialState: MeshState = {
	meshArray: [
		CubeMesh({
			name: "Cube_0",
			colour: "orange",
			size: [16, 16, 16],
			pos: [0, 0, 0],
			rot: [0, 0, 0],
			piv: [0, 0, 0],
			scale: 1,
			id: 0,
		}),
	],
	cubeCount: 1,
};

const meshSlice = createSlice({
	name: "mesh",
	initialState: meshInitialState,
	reducers: {
		meshAddRandom(state) {
			state.meshArray.push(
				CubeMesh({
					name: "Cube_" + state.cubeCount,
					colour: "orange",
					size: [16, 16, 16],
					pos: [Math.random() * 10, Math.random() * 10, Math.random() * 10],
					rot: [0, 0, 0],
					piv: [0, 0, 0],
					scale: 1,
					id: state.cubeCount,
				})
			);
			state.cubeCount++;
			console.log("Added cube from reducer");
		},
		testReducer(state) {
			console.log("Test reducer");
		},
		// meshAdd(state, action: PayloadAction<typeof Box>) {
		// 	// Action = CubeMesh
		// 	state.mesh.push(action.payload);
		// },
		// Define your reducers here
	},
});

const someSlice = createSlice({
	name: "some",
	initialState: {},
	reducers: {
		// Define your reducers here
	},
});

//export const { actions, reducer } = someSlice;
//export default someSlice.reducer;
export default meshSlice;
export const { meshAddRandom, testReducer } = meshSlice.actions;

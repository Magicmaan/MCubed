import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Box } from "@react-three/drei"; // Adjust the import path as necessary
import { BoxUVMap, createTexture, loadTexture } from "../util/textureUtil";
import * as THREE from "three";
import Cube, { CubeProps, GroupProps, THREEObjectProps } from "../primitives/Cube";
import { getBase64 } from "../util/baseSFUtil";

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
console.log("Sample UV", UVo);
const meshInitialState: MeshState = {
	cubeCount: cubeCount,
	textureCount: 1,
	mesh: [
		{
			type: "Cube",
			name: "Cube_" + cubeCount,
			colour: "#2f00ff",
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
		// {
		// 	type: "Cube",
		// 	name: "Cube_2",
		// 	colour: "#ff0000",
		// 	size: [16, 16, 16],
		// 	position: [10, 10, 10],
		// 	rotation: [0, 0, 0],
		// 	pivot: [0, 0, 0],
		// 	scale: 1,
		// 	uv: {
		// 		top: [0, 0, 1, 1],
		// 		bottom: [0, 0, 1, 1],
		// 		left: [0, 0, 1, 1],
		// 		right: [0, 0, 1, 1],
		// 		front: [0, 0, 1, 1],
		// 		back: [0, 0, 1, 1],
		// 	},
		// 	props: [],
		// 	id: cubeCount,
		// },
	],
	texture: [
		{
			name: "test",
			data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAASUExURZOfjLfGr8K8r/Lr2v8AAAAAADE4SVwAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHsSURBVGje7ZnhboMgFIUhqf8vSX0C6wtQ+b91fQDnwvu/yrCc6ypKO7XJFnP5d0LC/UQOHkFptAptqVbH6/GNiIzzzltrz6UvPbRN9Ki/uTbXXqvDQb/3I9Z1VfcjFoUuoq6hb1JDDv2n0EBAOYKMpjIS2EtCMK6QJ0oJjoGhr+BQoURFZ91Ycz8IGszB5rdAsRkb23mpFoJ9EBi0M9pSrdZWZq1c57rbGm+x5jus+bakRPs5rYLHvvoRpy4s2IUVtJ7rDwS2e1RhquHSltqEIK2QI5oQ5CpG3+cJMAeb38LaFchaCPZBsHYfYL19Rwpf35urluYD1ipY6rMfMVgsukzDhRW+xhourbAvJP0qWC4SWFQgVMhquNTGfeSOIK2QI0oJss8I32cSyjAHeutbWLsCWQuB5IPd5AOHfDBJ5TnNKV7yAWshkHywm3zgqaUV5wdBST6AFgLJBy/KBx75YOoJ+o1LVbBU/DpPXFiw6ypoPdf/gvODgSCtkCNKCZ7+maT9ICDJB0Ig+YBemw+Q+5//J4xP9/k/QwVXR4KF9wusJR8IwT8h+Pt80DTNJeNCeuRKvqNTp1P10Y+49PzgEFokwL3h8/+EsUv5nvKOYNn5wQ8B7g3zO8/8CcYwB5vfwtoVyFoIJB8YY8w3RwF7uApA/k0AAAAASUVORK5CYII=",
			path: "test",
			local_path: "test",
			width: 128,
			height: 128,
			active: true,
			id: 0,
		},
	],
};

// functions to modify mesh
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
			console.log("Mesh modify index", action.payload);
			console.log(action.payload);
			state.mesh[action.payload.index].colour = action.payload.colour;
			if (action.payload.position) {
				state.mesh[action.payload.index].position = action.payload.position;
			}
			if (action.payload.rotation) {
				state.mesh[action.payload.index].rotation = action.payload.rotation;
			}
			if (action.payload.scale) {
				state.mesh[action.payload.index].scale = action.payload.scale;
			}
			if (action.payload.uv) {
				state.mesh[action.payload.index].uv = action.payload.uv;
			}

			//state.mesh[action.payload.index].colour = "red";
		},
	},
});

//export const { actions, reducer } = someSlice;
//export default someSlice.reducer;
export default meshSlice;
export const { meshAddRandom, meshModify, meshModifyIndex } = meshSlice.actions;

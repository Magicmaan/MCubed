import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Box } from "@react-three/drei"; // Adjust the import path as necessary
import { createTexture } from "../util/textureUtil";
import * as THREE from "three";
import { CubeMesh } from "../primitives/Cube";

type viewportState = {
	cameraSettings: {
		pos?: [number, number, number]; // position of camera
		rot?: [number, number]; // 2 axis of rotation on camera
		zoom?: number; // zoom level of camera
		pivot?: [number, number, number]; // pivot point of camera
		projection?: "perspective" | "orthographic" | "Cube"; // camera projection
		fov?: number; // field of view
		props?: any; // additional camera properties
	};
	useGimbal?: {
		zoom: boolean;
		pan: boolean;
		rotate: boolean;
	};
	lookAt?: number; // cube index to look at (if any)
	background?: string; // background colour of viewport
	cameraLock?: [boolean, any]; // lock camera to object
	showGrid?: boolean;
	showStats?: boolean;
	mesh?: any[]; // Adjusted to any[] to avoid non-serializable issues
};
const viewportInitialState: viewportState = {
	cameraSettings: {
		pos: [10, 10, 10],
		rot: [0, 0],
		zoom: 0.5,
		pivot: [0, 0, 0],
		projection: "perspective",
		fov: 75,
	},
	useGimbal: {
		zoom: true,
		pan: true,
		rotate: true,
	},
	lookAt: undefined,
	background: "#000000",
	cameraLock: [false, null], // Changed function to null
	showGrid: true,
	showStats: false,
	mesh: [], // Ensure mesh elements are serializable
};

const viewportSlice = createSlice({
	name: "viewport",
	initialState: viewportInitialState,
	reducers: {
		test(state) {
			console.log("Test reducer for mesh");
		},

		disableGimbal(state) {
			state.useGimbal = {
				zoom: false,
				pan: false,
				rotate: false,
			};
		},
		enableGimbal(state) {
			state.useGimbal = {
				zoom: true,
				pan: true,
				rotate: true,
			};
		},
		toggleGrid(state) {
			state.showGrid = !state.showGrid;
		},
		toggleStats(state) {
			state.showStats = !state.showStats;
		},
		meshAdd(state, action: PayloadAction<any>) {
			state.mesh?.push(action.payload); // Ensure payload is serializable
		},
		// Define your reducers here
	},
});

export default viewportSlice;
export const { test, disableGimbal, enableGimbal, toggleGrid, meshAdd, toggleStats } =
	viewportSlice.actions;

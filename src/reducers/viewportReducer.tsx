import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Box } from "@react-three/drei"; // Adjust the import path as necessary
import { createTexture } from "../util/textureUtil";
import * as THREE from "three";
import { CubeMesh } from "../primitives/Cube";
import { RootState } from "@react-three/fiber";
import { MutableRefObject } from "react";

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
	selected?: number; // selected objects
	scene?: String; // scene object
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
	selected: 0, // initialize selected as an empty array
};

const viewportSlice = createSlice({
	name: "viewport",
	initialState: viewportInitialState,
	reducers: {
		test(state) {
			console.log("Test reducer for mesh");
		},

		disableGimbal(state, action: PayloadAction<[boolean, boolean, boolean]>) {
			state.useGimbal = {
				zoom: action.payload[0],
				pan: action.payload[1],
				rotate: action.payload[2],
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
		setSelected(state, action: PayloadAction<number | undefined>) {
			state.selected = action.payload;
		},
		setScene(state, action: PayloadAction<String>) {
			state.scene = action.payload;
		},
		// Define your reducers here
	},
});

export default viewportSlice;
export const {
	test,
	disableGimbal,
	enableGimbal,
	toggleGrid,
	meshAdd,
	toggleStats,
	setSelected,
	setScene,
} = viewportSlice.actions;

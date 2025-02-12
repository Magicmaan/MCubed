import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Box } from '@react-three/drei'; // Adjust the import path as necessary
import { createTexture } from '../../util/textureUtil';
import * as THREE from 'three';
import { RootState } from '@react-three/fiber';
import { MutableRefObject } from 'react';
import { texture } from 'three/webgpu';

type viewportState = {
	cameraSettings: {
		position?: [number, number, number]; // position of camera
		rotation?: [number, number]; // 2 axis of rotation on camera
		zoom?: number; // zoom level of camera
		pivot?: [number, number, number]; // pivot point of camera
		projection?: 'perspective' | 'orthographic' | 'Cube'; // camera projection
		fov?: number; // field of view
		props?: any; // additional camera properties
	};
	cameraControls: {
		zoom: boolean;
		pan: boolean;
		rotate: boolean;
	};
	background?: string; // background colour of viewport
	cameraLock: boolean; // lock camera to object

	renderMode?: 'wireframe' | 'solid' | 'texture' | 'render'; // render mode of viewport
	showGrid?: boolean;
	showStats?: boolean;
	selected?: string; // selected objects
	mesh?: any[]; // mesh array
	showWorldGrid?: boolean; // new value for showing world grid
};
const viewportInitialState: viewportState = {
	cameraSettings: {
		position: [10, 10, 10],
		rotation: [0, 0],
		zoom: 0.5,
		pivot: [0, 0, 0],
		projection: 'perspective',
		fov: 75,
	},
	cameraControls: {
		zoom: true,
		pan: true,
		rotate: true,
	},
	renderMode: 'texture',
	background: '#000000',
	cameraLock: false, // Changed function to null
	showGrid: true,
	showStats: false,
	selected: '0', // initialize selected as an empty array
	mesh: [], // initialize mesh as an empty array
	showWorldGrid: false, // initialize showWorldGrid
};

const viewportSlice = createSlice({
	name: 'viewport',
	initialState: viewportInitialState,
	reducers: {
		setRenderMode(
			state,
			action: PayloadAction<viewportState['renderMode']>
		) {
			state.renderMode = action.payload;
		},
		setControls(
			state,
			action: PayloadAction<{
				zoom?: boolean;
				pan?: boolean;
				rotate?: boolean;
			}>
		) {
			const zoom = action.payload.zoom ?? state.cameraControls.zoom;
			const pan = action.payload.pan ?? state.cameraControls.pan;
			const rotate = action.payload.rotate ?? state.cameraControls.rotate;

			console.log('Setting controls', zoom, pan, rotate);

			state.cameraControls = {
				zoom: zoom,
				pan: pan,
				rotate: rotate,
			};
		},
		setCameraLock(state, action: PayloadAction<boolean>) {
			state.cameraLock = action.payload;
		},
		toggleGrid(state) {
			state.showGrid = !state.showGrid;
		},
		toggleStats(state) {
			state.showStats = !state.showStats;
		},
		meshAdd(state, action: PayloadAction<any>) {
			if (!state.mesh) {
				state.mesh = [];
			}
			state.mesh.push(action.payload); // Ensure payload is serializable
		},

		setSelected(state, action: PayloadAction<string | undefined>) {
			state.selected = action.payload;
		},

		setCamera(
			state,
			action: PayloadAction<viewportState['cameraSettings']>
		) {
			state.cameraSettings = action.payload;
		},
		toggleWorldGrid(state) {
			state.showWorldGrid = !state.showWorldGrid;
		},
		// Define your reducers here
	},
});

export default viewportSlice;
export const {
	setControls,
	setCameraLock,
	setCamera,
	toggleGrid,
	setRenderMode,
	meshAdd,
	toggleStats,
	setSelected,
	toggleWorldGrid,
} = viewportSlice.actions;

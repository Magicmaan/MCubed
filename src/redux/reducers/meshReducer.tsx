import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Box } from '@react-three/drei'; // Adjust the import path as necessary
import { BoxUVMap, createTexture, loadTexture } from '../../util/textureUtil';
import * as THREE from 'three';
import Cube, { GroupProps } from '../../components/ThreeComponents/Cube';
import { getBase64, getFile } from '../../util/fileUtil';
import {
	MeshState,
	MeshStateSerialised,
	THREETextureProps,
} from '../../types/three';
import { CubeProps } from '../../types/three';
import undoable from 'redux-undo';
import { v4 as uuidv4 } from 'uuid';
import type { Expand } from '../../types/types';
import { saveMeshState } from '../../storage/meshStorage';
import { setLocalStorage } from '../../storage/localStorage';
import UV_template from '../../assets/textures/UV_template.png';

const cubeCount = 1;

const o1 = 1 / 8;
type CubePropsIndex = Expand<CubeProps & { index: number }>;

const UVo = {
	top: [o1, 0, o1 * 2, o1],
	bottom: [o1 * 2, 0, o1 * 3, o1],

	right: [o1, o1, o1 * 2, o1 * 2],
	front: [o1 * 3, o1, o1 * 4, o1 * 2],
	back: [o1 * 2, o1, o1 * 3, o1 * 2],
	left: [0, o1, o1, o1 * 2],
};

const meshInitialState: MeshState = {
	name: 'default',
	key: uuidv4(),
	cubeCount: 0,
	textureCount: 1,
	mesh: [],
	texture: [
		// {
		// 	name: 'test',
		// 	data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAbUExURf///yQiMhcVIg0MFuTAXPHPdbZvItWsQsmMNMmMu0YAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAENSURBVGje7ZQxjoNAEAT5gvkBJrBjBi2TI/kDlnz57Qk2PnRnYlbCPNt2MMlEbuKupKJpbbCqwjiUdds31cFcoLzubuPr0gwPVO1VY9eXZnig/ZKQ5dGb8YE5a9b7ZN4xkLrpsU1meOCU1/GSdDHjAxL+hii/5h0D3WXoZTHDA+e4/f/MYTHjL0hjiOuwmPEXrDFkTd9meEBX0Sgpm+EB0fcHymKGB6q6m7epKc3wQHmsNTfHyvzxoe8A3AXfAbgLvgNwF3wH4C74DsBd8B2Au+A7AHfBdwDugu8A3AXfAbgLvgNwF3wH4C74DsBd8B2Au+A7AHfBd2B3FwghhBBCCCGEEEIIIYQQQj6iKJ6VAumzIuHGAwAAAABJRU5ErkJggg==',
		// 	path: 'test',
		// 	local_path: 'test',
		// 	width: 128,
		// 	height: 128,
		// 	active: true,
		// 	id: 0,
		// },
		{
			name: 'template',
			data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAAxEHz4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAYUExURYv/AInlGQD/lhnlkP+iAOWaGQDL/xm85fS4KQgAAAAJcEhZcwAADsAAAA7AAWrWiQkAAAEaSURBVGje7ZTBDYNAEAOhA9ICdAAthA5IC1wHXPuJWN8+IbJ5ej/+nOaslXY6TD/GTO+YdY8pd9n1/XACpmk+Aeu6nYBSjvPBXf4AHQAjAG8Adjy8zicaiAB5iQYAMLwCMC8B2D4BOGq5y/h/GACYAdgAOMpdAiA3UAHKEl+YBfPB1D+nY3/OBuwR5TGxHkgfPNBABMhLNAAA4ohaRgPCAy0BkBuoAGWJrAfSB+zP2YA9ojwm1gPpgwcaiAB5iQYAQBxRy2hAeKAlAHIDFaAskfVA+oD9ORuwR5THxHogffBAAxEgL9EAAIgjahkNCA+0BEBuoAKUJVZx7AP7YLcP7AP7wD6wD+wD+8A+sA/sA/vAPrAP7IPLqfULwTtrNRImI8IAAAAASUVORK5CYII=',
			path: 'UV_template',
			local_path: 'UV_template',
			width: 128,
			height: 128,
			active: false,
			id: 'TEMPLATE',
		},
	],
	hasChanged: false,
	creationDate: Date.now(),
	lastModified: Date.now(),
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
				id: uuidv4(),
				auto_uv: true,
				visible: true,
				uv: new BoxUVMap({
					width: 16,
					height: 16,
					depth: 16,
				})
					.setPosition(0, 0)
					.toUVMap(128, 128) as any,
			});
			state.cubeCount++;
		},
		meshRemoveCube(state, action: PayloadAction<{ id: string }>) {
			const index = state.mesh.findIndex(
				(item) => item.id === action.payload.id
			);
			if (index !== -1) {
				state.mesh.splice(index, 1);
			}
		},

		meshModifyID(
			state,
			action: PayloadAction<Partial<CubeProps> & { updateUV?: boolean }>
		) {
			const p = action.payload;
			const index = state.mesh.findIndex((item) => item.id === p.id);

			if (index !== -1) {
				//Object.assign(mesh, p);

				state.mesh[index] = { ...state.mesh[index], ...p };
				const mesh = state.mesh[index];

				if (p.size && mesh.auto_uv) {
					mesh.uv = new BoxUVMap({
						width: p.size[0],
						height: p.size[1],
						depth: p.size[2],
					}).toUVMap(128, 128) as any;
				}
				const afterTime = new Date().toISOString();
			}
		},
		meshModifyIndex(
			state,
			action: PayloadAction<
				Expand<Omit<CubeProps, 'id'> & { index: number }>
			>
		) {
			const p = action.payload;
			if (p.index >= 0 && p.index < state.mesh.length) {
				// assign the new values to the mesh
				const mesh = state.mesh[p.index];
				Object.assign(mesh, p);

				if (p.size && mesh.auto_uv) {
					mesh.uv = new BoxUVMap({
						width: p.size[0],
						height: p.size[1],
						depth: p.size[2],
					})
						.setPosition(1, 1)
						.toUVMap(128, 128) as any;
				}
				const afterTime = new Date().toISOString();
			}
		},

		textureAdd(state, action: PayloadAction<THREETextureProps>) {
			state.texture.push(action.payload);
			state.textureCount++;
		},
		textureSetActive(state, action: PayloadAction<string>) {
			//uses id to set active texture
			const index = state.texture.findIndex(
				(item) => item.id === action.payload
			);
			if (index !== -1) {
				const oldTexture =
					state.texture[
						state.texture.findIndex((item) => item.active)
					];
				const newTexture = state.texture[index];
				state.texture.forEach((item) => (item.active = false));
				newTexture.active = true;

				// update UVs if the texture size has changed
				if (
					oldTexture &&
					(oldTexture.width !== newTexture.width ||
						oldTexture.height !== newTexture.height)
				) {
					state.mesh.forEach((cube) => {
						const uv = new BoxUVMap({ cubeID: cube.id })
							.fromUVMap(
								cube.uv,
								oldTexture.width,
								oldTexture.height
							)
							.toUVMap(newTexture.width, newTexture.height);
						cube.uv = uv;
					});
				}
			}
		},
		saveMeshCache(state) {
			saveMeshState(state, true);
		},
		saveMesh(state) {
			console.log('Saving mesh state');
			saveMeshState(state);
		},
		loadMesh(state, action: PayloadAction<MeshStateSerialised>) {
			Object.assign(state, action.payload);
		},

		setName(state, action: PayloadAction<string>) {
			if (state.name !== action.payload) {
				state.name = action.payload;
				state.hasChanged = true;
			}
		},

		reset(state) {
			Object.assign(state, meshInitialState);
			// generate a new key
			state.key = uuidv4();
			const url = new URL(window.location.href);
			url.searchParams.delete('id');
			window.history.replaceState({}, document.title, url.toString());
		},
	},
});

//export const { actions, reducer } = someSlice;
//export default someSlice.reducer;
export default meshSlice;
export const {
	meshModifyID,
	meshModifyIndex,
	meshAddCube,
	meshRemoveCube,
	saveMesh,
	loadMesh,
	saveMeshCache,
	setName,
	textureAdd,
	textureSetActive,
	reset,
} = meshSlice.actions;
export type { MeshState, MeshStateSerialised };

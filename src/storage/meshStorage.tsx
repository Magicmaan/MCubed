import path from 'path';
import fs from 'fs';
import { MeshState, MeshStateSerialised } from '../redux/reducers/meshReducer';
import {
	getLocalStorage,
	getLocalStorageKeys,
	setLocalStorage,
	setSessionStorage,
} from './localStorage';
import { v4 as uuidv4 } from 'uuid';

const serialiseMeshState = (meshState: MeshState): string | null => {
	// if (!meshState) {
	// 	return null;
	// }
	// if no mesh, or mesh is empty, or mesh has not changed, dont do anything
	// if (
	// 	!meshState.mesh ||
	// 	meshState.mesh.length === 0 ||
	// 	!meshState.hasChanged
	// ) {
	// 	return null;
	// }

	return JSON.stringify({
		...meshState,
	});
};

const saveMeshState = (meshState: MeshState, session: boolean = false) => {
	const serialisedMesh = serialiseMeshState(meshState);
	const key = meshState.key || uuidv4();
	console.log('Saving mesh state with key', key);
	console.log('Mesh state', serialisedMesh);
	if (serialisedMesh) {
		if (session) {
			setSessionStorage(key, serialisedMesh);
		} else {
			setLocalStorage(key, serialisedMesh);
		}
	}
};

// Get all mesh states from local storage and session storage
const getMeshStorage = () => {
	// Get all keys from local storage
	const storageKeys = getLocalStorageKeys();
	const storageValues = storageKeys.map((key) => {
		const data = getLocalStorage(key);
		if (data) {
			try {
				// Parse the data and check if it is a valid MeshState
				const obj = JSON.parse(data) as MeshState;
				if (obj.mesh && obj.mesh.length > 0) {
					return obj;
				}
			} catch (e) {
				console.log('Error parsing', e);
			}
		}
	});

	// Get all keys from session storage
	const sessionKeys = Object.keys(sessionStorage);
	const sessionValues = sessionKeys.map((key) => {
		const data = sessionStorage.getItem(key);
		if (data) {
			try {
				// Parse the data and check if it is a valid MeshState
				const obj = JSON.parse(data) as MeshState;
				if (obj.mesh && obj.mesh.length > 0) {
					return obj;
				}
			} catch (e) {
				console.log('Error parsing', e);
			}
		}
	});

	// Combine values from both storages
	const allValues = [...sessionValues, ...storageValues];

	// Sort values by creation date in descending order
	allValues
		.sort((a, b) => {
			if (a && b) {
				return a.creationDate - b.creationDate;
			}
			return 0;
		})
		.reverse();

	return allValues;
};

export { serialiseMeshState, saveMeshState, getMeshStorage };

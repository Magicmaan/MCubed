import path from 'path';
import fs from 'fs';
import { MeshState, MeshStateSerialised } from '../redux/reducers/meshReducer';
import {
	getLocalStorage,
	getLocalStorageKeys,
	setLocalStorage,
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

const saveMeshState = (meshState: MeshState) => {
	const serialisedMesh = serialiseMeshState(meshState);
	const key = meshState.key || uuidv4();
	console.log('Saving mesh state with key', key);
	console.log('Mesh state', serialisedMesh);
	if (serialisedMesh) {
		setLocalStorage(key, serialisedMesh);
	}
};

//get all mesh states from local storage
const getMeshStorage = () => {
	const storageKeys = getLocalStorageKeys();
	const storageValues = storageKeys.map((key) => {
		const data = getLocalStorage(key);
		if (data) {
			try {
				const obj = JSON.parse(data) as MeshState;
				//console.log(obj);
				if (obj.mesh && obj.mesh.length > 0) {
					return obj;
				}
			} catch (e) {
				console.log('Error parsing', e);
			}
		}
	});
	storageValues
		.sort((a, b) => {
			if (a && b) {
				return a.creationDate - b.creationDate;
			}
			return 0;
		})
		.reverse();

	return storageValues;
};

export { serialiseMeshState, saveMeshState, getMeshStorage };

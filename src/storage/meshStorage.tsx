import path from 'path';
import fs from 'fs';
import { MeshState, MeshStateSerialised } from '../redux/reducers/meshReducer';
import { setLocalStorage } from './localStorage';
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
	console.log('Saved mesh state with key', key);
};

const readBBModel = (path: string) => {
	const data = fs.readFileSync(path, 'utf8');
	console.log(data);
};

export { serialiseMeshState, saveMeshState, readBBModel };

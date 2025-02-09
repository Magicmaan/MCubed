import { CubeProps, MeshState, THREETextureProps } from '../types/three';
import { BBModelCube, BBModelFile } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { BoxUVMap } from './textureUtil';
import path from 'path';
import { Euler } from 'three';

// const getBase64 = (file) => {
// 	// Make new FileReader
// 	const reader = new FileReader();
// 	// Convert the file to base64 text
// 	reader.readAsDataURL(file);

// 	// Return the result
// 	return new Promise((resolve) => {
// 		reader.onload = () => {
// 			resolve(reader.result as string);
// 		};
// 	});
// };

const getBase64 = (file: Blob): string => {
	let result = '';
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = () => {
		return reader.result as string;
	};
	//while (reader.readyState !== 2) {} // Wait until the file is read
};

const getFile = (p: string): File => {
	const getFile = async (filePath: string): Promise<File> => {
		const data = await fs.readFile(filePath);
		const file = new File([data], path.basename(filePath));
		return file;
	};
	const file = getFile(p);
	file.then((data) => {
		return data;
	});
};

const getData = (file: File): Promise<string> => {
	// return data of the file as text
	return new Promise((resolve) => {
		// Make new FileReader
		const reader = new FileReader();
		// Convert the file to text
		reader.readAsText(file);
		//return the result
		reader.onload = () => {
			resolve(reader.result as string);
		};
	});
};

const verifyBBModel = (data: BBModelFile) => {
	if (!data) {
		console.error('No data found');
		return false;
	}

	// check that the model format is modded_entity
	if (data.meta.model_format !== 'modded_entity') {
		console.error('Model format not modded_entity');
		return false;
	}
	// check for box uv
	if (data.meta.box_uv === false) {
		console.error('Box UV not enabled');
		return false;
	}

	// check that there are elements
	if (data.elements.length === 0) {
		console.error('No elements found');
		return false;
	}

	return true;
};

const mapCube = (cube: BBModelCube, uvWidth: number, uvHeight: number) => {
	const size = [
		Math.abs(cube.to[0] - cube.from[0]),
		Math.abs(cube.to[1] - cube.from[1]),
		Math.abs(cube.to[2] - cube.from[2]),
	];
	// const position = [
	// 	cube.from[0] + size[0] / 2,
	// 	cube.from[1] + size[1] / 2,
	// 	cube.from[2] + size[2] / 2,
	// ];
	const position = cube.origin;

	if (cube.rotation === undefined) {
		cube.rotation = [0, 0, 0];
	}
	const temprot = cube.rotation.map((angle) => (angle * Math.PI) / 180);

	// blockbench uses ZYX rotation order
	// we need to convert it to XYZ as that is what three.js uses
	const rotation = new Euler(temprot[0], temprot[1], temprot[2], 'ZYX')
		.reorder('XYZ')
		.toArray();

	if (cube.uv_offset === undefined) {
		cube.uv_offset = [0, 0];
	}

	const UvMapN = new BoxUVMap({
		cubeID: cube.uuid,
		width: size[0],
		height: size[1],
		depth: size[2],
	}).setPosition(cube.uv_offset[0], cube.uv_offset[1]);

	//this is janky as hell
	//i dont understand format, for some reason the front and back faces are flipped??
	const uvMap = UvMapN.toUVMap(uvWidth, uvHeight);
	const temp = uvMap.front;
	uvMap.front = uvMap.back;
	uvMap.back = temp;
	//ignore for now
	if (cube.mirror_uv) {
		console.log('Mirroring UV');
	}

	console.log('Origin is not the same as position');
	const pivot = cube.origin; // The rotation pivot (center of rotation)
	const rotatedPosition = [0, 0, 0]; // Initialize rotated position

	const cosX = Math.cos(rotation[0]);
	const sinX = Math.sin(rotation[0]);
	const cosY = Math.cos(rotation[1]);
	const sinY = Math.sin(rotation[1]);
	const cosZ = Math.cos(rotation[2]);
	const sinZ = Math.sin(rotation[2]);

	// Apply rotation to compute new position relative to the origin
	rotatedPosition[0] =
		(position[0] - pivot[0]) * (cosY * cosZ) +
		(position[1] - pivot[1]) * (cosX * sinZ + sinX * sinY * cosZ) +
		(position[2] - pivot[2]) * (sinX * sinZ - cosX * sinY * cosZ);

	rotatedPosition[1] =
		(position[0] - pivot[0]) * (-cosY * sinZ) +
		(position[1] - pivot[1]) * (cosX * cosZ - sinX * sinY * sinZ) +
		(position[2] - pivot[2]) * (sinX * cosZ + cosX * sinY * sinZ);

	rotatedPosition[2] =
		(position[0] - pivot[0]) * sinY +
		(position[1] - pivot[1]) * (-sinX * cosY) +
		(position[2] - pivot[2]) * (cosX * cosY);

	// Compute final world-space position from origin
	position[0] = rotatedPosition[0] + pivot[0];
	position[1] = rotatedPosition[1] + pivot[1];
	position[2] = rotatedPosition[2] + pivot[2];

	// Create a new cube
	return {
		type: 'Cube',
		name: cube.name,
		colour: 'red',
		size: size,
		position: position,
		rotation: rotation,
		pivot: [0, 0, 0],
		scale: cube.inflate,
		visible: true,
		id: cube.uuid,
		auto_uv: true,
		uv: uvMap,
	} as CubeProps;
};

const loadBBModelToMesh = async (file: File) => {
	const data = JSON.parse(await getData(file)) as BBModelFile;
	let mesh: CubeProps[] = [];
	let textures: THREETextureProps[] = [];
	if (verifyBBModel(data)) {
		console.log('Loaded BBModel file', data);

		mesh = data.elements.map((cube) =>
			mapCube(cube, data.textures[0].width, data.textures[0].height)
		);
		textures = data.textures.map((texture) => {
			return {
				name: texture.name,
				data: texture.source,
				path: texture.path,
				local_path: texture.path,
				width: texture.width,
				height: texture.height,
				active: true,
				id: texture.id,
			} as THREETextureProps;
		});
		console.log('Mapped cubes', mesh);
		console.log('Textures', textures);
	} else {
		throw new Error('Invalid BBModel file');
	}

	const newState = {
		name: data.name,
		texture: textures,
		mesh: mesh,
		key: uuidv4(),
		hasChanged: true,
		creationDate: Date.now(),
		lastModified: Date.now(),
	} as MeshState;

	return newState;

	// Load data as mesh
	//const JSONData = JSON.parse(data);
};
// Load data as mesh

export { getBase64, getData, loadBBModelToMesh, getFile };

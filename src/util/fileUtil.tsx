import { CubeProps, THREETextureProps } from '../types/three';
import { BBModelCube, BBModelFile } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { BoxUVMap } from './textureUtil';
import path from 'path';

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
	const position = [
		cube.from[0] + size[0] / 2,
		cube.from[1] + size[1] / 2,
		cube.from[2] + size[2] / 2,
	];

	if (cube.rotation === undefined) {
		cube.rotation = [0, 0, 0];
	}
	const rotation = cube.rotation.map((angle) => (angle * Math.PI) / 180);
	if (cube.uv_offset === undefined) {
		cube.uv_offset = [0, 0];
	}

	const UvMapN = new BoxUVMap({
		cubeID: cube.uuid,
		width: size[0],
		height: size[1],
		depth: size[2],
	}).setPosition(cube.uv_offset[0], cube.uv_offset[1]);

	const uvMap = UvMapN.toUVMap(uvWidth, uvHeight);

	const temp = uvMap.front;
	uvMap.front = uvMap.back;
	uvMap.back = temp;

	if (cube.mirror_uv) {
		console.log('Mirroring UV');
	}

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

	return { mesh, textures };
	// Load data as mesh
	//const JSONData = JSON.parse(data);
};
// Load data as mesh

export { getBase64, getData, loadBBModelToMesh, getFile };

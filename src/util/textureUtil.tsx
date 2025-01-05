import { color } from 'three/webgpu';
import * as THREE from 'three';
import { randomCubeColour } from '../constants/CubeColours';
import { CubeProps } from '../components/ThreeComponents/Cube';

const createTexture = (width: number, height: number, color?: string) => {
	if (color === null) {
		color = randomCubeColour();
	}
	let textureData = createTextureData(width, height, 'purple');
	//addDither(textureData, width, height, "#000000");
	addOutline(textureData, width, height, lightenColor('purple', 1));

	// used the buffer to create a DataTexture
	const texture = new THREE.DataTexture(textureData, width, height);
	texture.needsUpdate = true;
	return texture;
};

const addOutline = (
	textureData: Uint8Array,
	width: number,
	height: number,
	color: string
) => {
	const { r, g, b } = splitColorToRGB(color);

	// Add black outline around textureData
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const isBorder =
				x === 0 || y === 0 || x === width - 1 || y === height - 1;
			if (isBorder) {
				const stride = (y * width + x) * 4;
				textureData[stride] = r; // R
				textureData[stride + 1] = g; // G
				textureData[stride + 2] = b; // B
				textureData[stride + 3] = 255; // A
			}
		}
	}
};

const splitColorToRGB = (color: string) => {
	const ccolor = new THREE.Color(color);
	const r = Math.floor(ccolor.r * 255);
	const g = Math.floor(ccolor.g * 255);
	const b = Math.floor(ccolor.b * 255);
	return { r, g, b };
};

const darkenColor = (color: string, factor: number) => {
	const ccolor = new THREE.Color(color);
	ccolor.offsetHSL(0, -factor / 1.5, -factor * 1.5);
	return ccolor.getHexString();
};
const lightenColor = (color: string, factor: number) => {
	const colorObj = new THREE.Color(color);
	colorObj.multiplyScalar(1 + factor);
	return '#' + colorObj.getHexString();
};

const addGrid = (
	textureData: Uint8Array,
	width: number,
	height: number,
	color?: string
) => {
	const size = width * height;
	const { r, g, b } = splitColorToRGB(color || '#000000');
	for (let i = 0; i < size; i++) {
		if (i % 2 === 0) {
			continue;
		}
		const stride = i * 4;
		textureData[stride] = r;
		textureData[stride + 1] = g;
		textureData[stride + 2] = b;
		textureData[stride + 3] = 255;
	}
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if ((x + y) % 2 === 0) {
				const stride = (y * width + x) * 4;
				textureData[stride] = r; // R
				textureData[stride + 1] = g; // G
				textureData[stride + 2] = b; // B
				textureData[stride + 3] = 255; // A
			}
		}
	}
	console.log('Dither added');
};

const addDither = (
	textureData: Uint8Array,
	width: number,
	height: number,
	color?: string
) => {
	const { r, g, b } = splitColorToRGB(color || '#000000');
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if ((x + y) % 2 === 1) {
				const stride = (y * width + x) * 4;
				textureData[stride] = r; // R
				textureData[stride + 1] = g; // G
				textureData[stride + 2] = b; // B
				textureData[stride + 3] = 255; // A
			}
		}
	}
};

const createTextureData = (width: number, height: number, color: string) => {
	const size = width * height;
	const data = new Uint8Array(4 * size);
	const colorObj = new THREE.Color(color || 0xffffff);

	const r = Math.floor(colorObj.r * 255);
	const g = Math.floor(colorObj.g * 255);
	const b = Math.floor(colorObj.b * 255);

	for (let i = 0; i < size; i++) {
		const stride = i * 4;
		data[stride] = r;
		data[stride + 1] = g;
		data[stride + 2] = b;
		data[stride + 3] = 255;
	}

	return data;
};

const loadTexture = (url: string) => {
	const loader = new THREE.TextureLoader();
	const texture = loader.load(
		url, // Ensure this path is correct
		() => {
			console.log('Texture loaded successfully');
			texture.minFilter = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
		},
		undefined,
		(err) => {
			console.error('An error occurred loading the texture', err);
		}
	);
	return texture;
};

class BoxUVMap {
	width: number;
	height: number;
	depth: number;

	boxBounds: {
		x: number;
		y: number;
		w: number;
		h: number;
	};

	top: number[];
	bottom: number[];
	left: number[];
	right: number[];
	front: number[];
	back: number[];

	position: { x: number; y: number } = { x: 0, y: 0 };

	ONE_UNIT = 1 / 8;
	constructor({
		width = 0,
		height = 0,
		depth = 0,
	}: {
		width?: number;
		height?: number;
		depth?: number;
	}) {
		this.width = width;
		this.height = height;
		this.depth = depth;

		this.top = [0, 0, 0, 0];
		this.bottom = [0, 0, 0, 0];
		this.left = [0, 0, 0, 0];
		this.right = [0, 0, 0, 0];
		this.front = [0, 0, 0, 0];
		this.back = [0, 0, 0, 0];
		this.unwrapBox();
		this.boxBounds = { x: 0, y: 0, w: 0, h: 0 };
	}

	unwrapBox() {
		var leftS = { x: 0, y: this.depth, w: this.depth, h: this.height };
		var frontS = {
			x: this.depth,
			y: this.depth,
			w: this.width,
			h: this.height,
		};
		var rightS = {
			x: this.depth + this.width,
			y: this.depth,
			w: this.depth,
			h: this.height,
		};
		var backS = {
			x: this.depth + this.width + this.depth,
			y: this.depth,
			w: this.width,
			h: this.height,
		};
		var topS = { x: this.depth, y: 0, w: this.width, h: this.depth };
		var bottomS = {
			x: this.depth + this.width,
			y: 0,
			w: this.width,
			h: this.depth,
		};

		this.top = [topS.x, topS.y, topS.w, topS.h];
		this.bottom = [bottomS.x, bottomS.y, bottomS.w, bottomS.h];
		this.left = [leftS.x, leftS.y, leftS.w, leftS.h];
		this.right = [rightS.x, rightS.y, rightS.w, rightS.h];
		this.front = [frontS.x, frontS.y, frontS.w, frontS.h];
		this.back = [backS.x, backS.y, backS.w, backS.h];
	}

	toPixels() {
		const tUV = this.applyPosition();

		return tUV;
	}
	// prettier-ignore
	toUVMap(width: number, height: number) {
		//format is stored in x,y,w,h
		//uv format is stored in x,y,w+x,h+y (absolute positions)
		//input width, height is needed to convert to uv format (ranges 0-1)
		const tUV = this.applyPosition();

		return {
			top: 	[tUV.top[0] / width, tUV.top[1] / height, tUV.top[2] / width + tUV.top[0] / width, tUV.top[3] / height + tUV.top[1] / height],
			bottom: [tUV.bottom[0] / width, tUV.bottom[1] / height, tUV.bottom[2] / width + tUV.bottom[0] / width, tUV.bottom[3] / height + tUV.bottom[1] / height],
			left: [tUV.left[0] / width, tUV.left[1] / height, tUV.left[2] / width + tUV.left[0] / width, tUV.left[3] / height + tUV.left[1] / height],
			right: [tUV.right[0] / width, tUV.right[1] / height, tUV.right[2] / width + tUV.right[0] / width, tUV.right[3] / height + tUV.right[1] / height],
			front: [tUV.front[0] / width, tUV.front[1] / height, tUV.front[2] / width + tUV.front[0] / width, tUV.front[3] / height + tUV.front[1] / height],
			back: [tUV.back[0] / width, tUV.back[1] / height, tUV.back[2] / width + tUV.back[0] / width, tUV.back[3] / height + tUV.back[1] / height]
		} as { top: [number, number, number, number], bottom: [number, number, number, number], left: [number, number, number, number], right: [number, number, number, number], front: [number, number, number, number], back: [number, number, number, number] };
	}

	applyPosition() {
		const translatedUV = {
			top: [
				this.top[0] + this.position.x,
				this.top[1] + this.position.y,
				this.top[2],
				this.top[3],
			],
			bottom: [
				this.bottom[0] + this.position.x,
				this.bottom[1] + this.position.y,
				this.bottom[2],
				this.bottom[3],
			],
			left: [
				this.left[0] + this.position.x,
				this.left[1] + this.position.y,
				this.left[2],
				this.left[3],
			],
			right: [
				this.right[0] + this.position.x,
				this.right[1] + this.position.y,
				this.right[2],
				this.right[3],
			],
			front: [
				this.front[0] + this.position.x,
				this.front[1] + this.position.y,
				this.front[2],
				this.front[3],
			],
			back: [
				this.back[0] + this.position.x,
				this.back[1] + this.position.y,
				this.back[2],
				this.back[3],
			],
		};
		return translatedUV;
	}

	setPosition(x: number, y: number) {
		this.position = { x, y };
	}
}

const boxUVToVertexArray = (uv: {
	top: [number, number, number, number];
	bottom: [number, number, number, number];
	left: [number, number, number, number];
	right: [number, number, number, number];
	front: [number, number, number, number];
	back: [number, number, number, number];
}) => {
	const uvArray = new Float32Array(48);
	const convertToTrianglePositions = ([x1, y1, x2, y2]: number[]) => [
		x1,
		1 - y1,
		x2,
		1 - y1,
		x1,
		1 - y2,
		x2,
		1 - y2,
	];
	uvArray.set(convertToTrianglePositions(uv.left), 0);
	uvArray.set(convertToTrianglePositions(uv.right), 8);
	uvArray.set(convertToTrianglePositions(uv.top), 16);
	uvArray.set(convertToTrianglePositions(uv.bottom), 24);
	uvArray.set(convertToTrianglePositions(uv.front), 32);
	uvArray.set(convertToTrianglePositions(uv.back), 40);
	return uvArray;
};

export {
	createTexture,
	darkenColor,
	lightenColor,
	loadTexture,
	boxUVToVertexArray,
	BoxUVMap,
};

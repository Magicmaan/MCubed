import { color } from "three/webgpu";
import * as THREE from "three";
import { randomCubeColour } from "../constants/CubeColours";

const createTexture = (width: number, height: number, color?: string) => {
	if (color === null) {
		color = randomCubeColour();
	}
	let textureData = createTextureData(width, height, "purple");
	//addDither(textureData, width, height, "#000000");
	addOutline(textureData, width, height, lightenColor("purple", 1));

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
			const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
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
	return "#" + colorObj.getHexString();
};

const addGrid = (
	textureData: Uint8Array,
	width: number,
	height: number,
	color?: string
) => {
	const size = width * height;
	const { r, g, b } = splitColorToRGB(color || "#000000");
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
	console.log("Dither added");
};

const addDither = (
	textureData: Uint8Array,
	width: number,
	height: number,
	color?: string
) => {
	const { r, g, b } = splitColorToRGB(color || "#000000");
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
			console.log("Texture loaded successfully");
			texture.minFilter = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
		},
		undefined,
		(err) => {
			console.error("An error occurred loading the texture", err);
		}
	);
	return texture;
};

export { createTexture, darkenColor, lightenColor, loadTexture };

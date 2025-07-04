import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { v4 } from 'uuid';

export type CubeProps = {
	id: string;
	type: 'Cube';
	name: string;
	size: [number, number, number];
	position: [number, number, number];
	rotation: [number, number, number];
	scale: number;
	pivot: [number, number, number];
	visible: boolean;
	// material
	colour: string;
	auto_uv: boolean;
	uv: {
		top: [number, number, number, number];
		bottom: [number, number, number, number];
		left: [number, number, number, number];
		right: [number, number, number, number];
		front: [number, number, number, number];
		back: [number, number, number, number];
	};
	props?: any[];
};
export type THREETextureProps = {
	name: string;
	data: string;
	path: string;
	local_path: string;

	width: number;
	height: number;

	active: boolean;
	id: string;
};

export type BoxUV = {
	top: [number, number, number, number];
	bottom: [number, number, number, number];
	left: [number, number, number, number];
	right: [number, number, number, number];
	front: [number, number, number, number];
	back: [number, number, number, number];
};

export type CubeRepresentation = {
	id: number;
	name: string;

	size: THREE.Vector3;
	position: THREE.Vector3;
	rotation: THREE.Euler;
	pivot: THREE.Vector3;
	scale: number;

	textureID: number;
	UV: BoxUV;
	autoUV: boolean;
	visible: boolean;
	colour: string;

	mesh: THREE.Mesh;
};

export type THREEObjectProps = {
	type?: 'Cube' | 'Group';
	size?: [number, number, number];
	position: [number, number, number];
	rotation: [number, number, number];
	scale: number;
	pivot: [number, number, number];

	id: number;
	props: any[];

	ref?: React.RefObject<THREE.Mesh>;
	name: string;
	children?: CubeProps[];
	colour?: string;
	material?: THREE.Material;
	cubeMesh?: JSX.Element;
	texture?: THREE.Texture;
	uv?: {
		top: [number, number, number, number];
		bottom: [number, number, number, number];
		left: [number, number, number, number];
		right: [number, number, number, number];
		front: [number, number, number, number];
		back: [number, number, number, number];
	};

	onClick?: (event: ThreeEvent<MouseEvent>) => void;
	onHover?: (event: THREE.Event) => void;
	onPointerOver?: (event: THREE.Event) => void;
	onPointerOut?: (event: THREE.Event) => void;
};

export type MeshState = {
	name: string;
	key: string;
	mesh: CubeProps[];
	texture: THREETextureProps[];
	cubeCount: number;
	textureCount: number;

	hasChanged: boolean;
	creationDate: number;
	lastModified: number;

	exportScene: boolean;
};

export type MeshStateSerialised = {
	name: string;
	key: string;
	mesh: CubeProps[];
	texture: THREETextureProps[];
	cubeCount: number;
	textureCount: number;

	hasChanged: boolean;
	creationDate: number;
	lastModified: number;
};

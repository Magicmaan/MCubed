import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

export type CubeProps = {
	type: 'Cube';
	name: string;
	size: [number, number, number];
	position: [number, number, number];
	rotation: [number, number, number];
	scale: number;
	pivot: [number, number, number];
	id: number;

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
	id: number;
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

import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";
import * as React from "react";
import { Canvas, ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import {
	OrbitControls,
	Hud,
	PerspectiveCamera,
	Box,
	CubeTexture,
	useCubeTexture,
	useTexture,
	Texture,
} from "@react-three/drei";
import { BufferGeometry } from "@react-three/fiber";
import { modelContext } from "../components/Viewport/ModelContext";
import { createTexture } from "../util/textureUtil";
import { useMeshSelector, useViewportSelector } from "../hooks/useRedux";

let cubeCount = 0;
function setCubeCount(count: number) {
	cubeCount = count;
}

type THREEObjectProps = {
	type?: "Cube" | "Group";
	size?: [number, number, number];
	position: [number, number, number];
	rotation: [number, number, number];
	scale: number;
	pivot: [number, number, number];

	id: number;
	props: any[];

	ref?: React.RefObject<THREE.Mesh>;
	name: string;
	children?: CubeProps[] | GroupProps[];
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

type CubeProps = {
	type: "Cube";
	name: string;
	size: [number, number, number];
	position: [number, number, number];
	rotation: [number, number, number];
	scale: number;
	pivot: [number, number, number];
	id: number;

	// material
	colour: string;
	material?: THREE.Material;
	texture?: THREE.Texture;
	cubeMesh?: JSX.Element;
	uv?: {
		top: [number, number, number, number];
		bottom: [number, number, number, number];
		left: [number, number, number, number];
		right: [number, number, number, number];
		front: [number, number, number, number];
		back: [number, number, number, number];
	};

	// callbacks
	onClick?: (event: THREE.Event) => void;
	onHover?: (event: THREE.Event) => void;
	onPointerOver?: (event: THREE.Event) => void;
	onPointerOut?: (event: THREE.Event) => void;
};

type GroupProps = {
	type: "Group";
	name: string;
	size: [number, number, number];
	position: [number, number, number];
	rotation: [number, number, number];
	scale: number;
	pivot: [number, number, number];
	id: number;

	children: CubeProps[] | GroupProps[];
};

const CubeMesh: React.FC<CubeProps> = ({
	name,
	colour,
	size,
	position,
	rotation,
	pivot,
	scale,
	id,
	type = "Cube",
	texture,

	onClick,
	onHover,
	onPointerOver,
	onPointerOut,
	...props
}) => {
	return (
		<mesh
			{...props}
			position={position}
			rotation={rotation}
			scale={scale}
			key={id}
			type={type}
			onUpdate={(self) => {
				console.log("CubeMesh onUpdate");
				self.updateMatrixWorld(true);
			}}
			onClick={onClick}>
			<boxGeometry args={size} />
			<meshStandardMaterial
				map={texture} // Use the cube texture as environment map
				envMapIntensity={1} // Ensure the environment map intensity is set
				color={colour || "#ffffff"} // Fallback color
				transparent={true}
				alphaTest={0.5} // Use alpha of the texture
				side={THREE.FrontSide} // Render texture on both sides
				shadowSide={THREE.FrontSide}
				toneMapped={false} // Render texture at full brightness
			/>
		</mesh>
	);
};

const GroupMesh: React.FC<GroupProps> = ({
	name,
	size,
	position,
	rotation,
	scale,
	pivot,
	id,
	children,
	type = "Group",
	...props
}) => {
	const testCube = CubeMesh({
		type: "Cube",
		name: "testCube",
		colour: "#ff0000",
		size: [8, 8, 8],
		position: [0, 0, 0],
		rotation: [0, 0, 0],
		scale: 1,
		pivot: [0, 0, 0],
		id: 0,
	});
	return <group {...props}></group>;
};

// returns an array representing cube data

export default CubeMesh;
export { CubeMesh, setCubeCount };
export type { CubeProps, GroupProps, THREEObjectProps };

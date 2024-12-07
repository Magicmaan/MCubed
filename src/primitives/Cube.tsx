import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera, Box } from "@react-three/drei";
import { BufferGeometry } from "@react-three/fiber";
import { modelContext } from "../components/Viewport/ModelContext";
import { createTexture } from "../util/textureUtil";

let cubeCount = 0;
function setCubeCount(count: number) {
	cubeCount = count;
}

type CubeProps = {
	name?: string;
	colour?: string;
	size?: [number, number, number];
	pos?: [number, number, number];
	rot?: [number, number, number];
	piv?: [number, number, number];
	scale?: number;
	props?: any[];
	id?: number;
	cubeMesh?: JSX.Element;
};

function CubeMesh({ name, colour, size, pos, rot, piv, scale, id, ...props }: CubeProps) {
	return (
		<Box
			matrixAutoUpdate={false}
			name={name}
			type="Mesh_Cube"
			args={size}
			position={pos}
			rotation={rot}
			scale={scale}
			onClick={(e) => {
				const { id, name, color } = e.object.userData;
				console.log(`Clicked BALLS ${name} with id ${id} and color ${color}`);

				//setSelected([parseInt(id)]);
			}}
			userData={{ id: id, name: name, color: colour }}>
			<meshStandardMaterial
				map={createTexture(16, 16, colour)}
				color={colour}
				transparent={true}
				alphaTest={0.5} // Use alpha of the texture
				side={THREE.DoubleSide} // Render texture on both sides
				shadowSide={THREE.DoubleSide}
				toneMapped={false} // Render texture at full brightness
			/>
		</Box>
	);
}

// returns an array representing cube data
function Cube({
	name = "Cube",
	colour = "orange",
	size = [1, 1, 1],
	pos = [0, 0, 0],
	rot = [0, 0, 0],
	piv = [0, 0, 0],
	scale = 1,
	...props
}: CubeProps) {
	setCubeCount(cubeCount + 1);
	const id = cubeCount;
	if (name === "Cube") {
		name = `Cube_${id}`;
	}
	const cubeMesh = CubeMesh({
		name,
		colour,
		size,
		pos,
		rot,
		piv,
		scale,
		id,
		...props,
	});
	return {
		name,
		colour,
		size,
		pos,
		rot,
		piv,
		scale,
		id,
		cubeMesh,
	} as CubeProps;
}

export default Cube;
export { CubeMesh, setCubeCount };
export type { CubeProps };

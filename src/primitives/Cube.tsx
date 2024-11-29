import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera } from "@react-three/drei";
import { modelContext } from "../context/ModelContext";
let cubeCount = 0;
function setCubeCount(count: number) {
	cubeCount = count;
}

type CubeProps = {
	colour?: string;
	size?: [number, number, number];
	pos?: [number, number, number];
	rot?: [number, number, number];
	piv?: [number, number, number];
	scale?: number;
	props?: any[];
	id?: number;
};

// returns an array representing cube data
function Cube({
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
	return {
		colour,
		size,
		pos,
		rot,
		piv,
		scale,
		id,
		...Object.values(props),
	} as CubeProps;
}

export default Cube;
export type { CubeProps };
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera } from "@react-three/drei";

function Cube({
	color = "orange",
	size = [1, 1, 1],
	...props
}: {
	color?: string;
	size?: [number, number, number];
	[key: string]: any;
}) {
	const ref = React.useRef<THREE.Mesh>(null!);
	const [hovered, hover] = React.useState(false);
	const [clicked, click] = React.useState(false);

	// rotates the cube
	useFrame((state, delta) => (ref.current.rotation.x += delta * Math.random() * 10));

	return (
		<mesh
			{...props}
			ref={ref}
			onClick={() => click(!clicked)}
			onPointerOver={(event) => (event.stopPropagation(), hover(true))}
			onPointerOut={() => hover(false)}>
			<boxGeometry args={[size[0], size[1], size[2]]} />
			<meshStandardMaterial color={hovered ? "hotpink" : color} />
		</mesh>
	);
}
export default Cube;

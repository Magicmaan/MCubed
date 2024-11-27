import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera } from "@react-three/drei";
import Cube from "./primitives/Cube";

function Viewport({ color = "orange", ...props }) {
	const content = [
		<Cube position={[-1.2, 0, 0]} scale={1} />,
		<Cube color="skyblue" position={[1.2, 0, 0]} scale={0.5} />,
	];

	return (
		<Canvas className="w-screen">
			<PerspectiveCamera makeDefault position={[0, 0, 5]} />
			<ambientLight intensity={Math.PI / 2} />
			<spotLight
				position={[10, 10, 10]}
				angle={0.15}
				penumbra={1}
				decay={0}
				intensity={Math.PI}
			/>
			<pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
			{content}

			<OrbitControls />
		</Canvas>
	);
}
export default Viewport;

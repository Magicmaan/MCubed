import { Canvas, useThree } from "@react-three/fiber";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const sceneRef = useRef<THREE.Scene | null>(null);

const GetSceneRef = () => {
	const GetRef = () => {
		const { scene } = useThree();
		useEffect(() => {
			if (sceneRef) {
				sceneRef.current = scene;
			}
		}, [scene]);
		return null;
	};

	return (
		<Canvas>
			<GetRef />
		</Canvas>
	);
};

export default GetSceneRef;

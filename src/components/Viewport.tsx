import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";
import { BoxGeometry } from "three";
import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera, Grid } from "@react-three/drei";
import { modelContext, useModelContext } from "../context/ModelContext";
import { CubeProps } from "../primitives/Cube";
import { useViewportContext } from "../context/ViewportContext";
import { Stats } from "@react-three/drei";

function unpackModel(model: CubeProps[]) {
	let unpackedModel: React.ReactNode[] = [];
	model.forEach((item: CubeProps) => {
		unpackedModel.push(
			<mesh
				position={item.pos}
				rotation={item.rot}
				scale={item.scale}
				key={item.id ? item.id.toString() : Math.random() * 100}>
				<boxGeometry
					args={item.size ? [item.size[0], item.size[1], item.size[2]] : [1, 1, 1]}
				/>
				<meshStandardMaterial color={item.colour} />
			</mesh>
		);
	});
	return unpackedModel;
}

function Viewport() {
	const { model, selected } = useModelContext();
	const [modelData, setModelData] = React.useState<React.ReactNode[]>([]);
	const settings = useViewportContext();

	// Unpack the model data and bind it to the model
	React.useEffect(() => {
		setModelData(unpackModel(model));
	}, [model]);

	console.log(settings);
	return (
		<Canvas
			className="w-full h-full pattern-1"
			camera={{ fov: settings.camera.fov, position: settings.camera.pos }}>
			<PerspectiveCamera
				makeDefault
				position={settings.camera.pos}
				fov={settings.camera.fov}
			/>
			<ambientLight intensity={Math.PI / 2} />
			<spotLight
				position={[10, 10, 10]}
				angle={0.15}
				penumbra={1}
				decay={0}
				intensity={Math.PI}
			/>
			<pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

			{modelData}
			<Grid
				cellSize={1}
				cellThickness={1}
				cellColor={"#FF0000"}
				sectionSize={2}
				sectionThickness={2}
			/>
			<OrbitControls />
			<Stats />
		</Canvas>
	);
}

export default Viewport;

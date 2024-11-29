import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "../App.css";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera } from "@react-three/drei";
import Viewport from "../components/Viewport";
import Cube from "../primitives/Cube.tsx";
import { CubeProps } from "../primitives/Cube.tsx";
import { modelContext, ModelContextProvider } from "../context/ModelContext";
import ModelPartView from "../components/ModelPartView";
import { randomCubeColour } from "../constants/CubeColours.tsx";

function ModelView() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);
	const [model, setModel] = React.useState<CubeProps[]>([]);

	React.useEffect(() => {
		setModel([
			Cube({ colour: randomCubeColour(), pos: [1.2, 0, 0], scale: 0.5 }),
			Cube({ colour: randomCubeColour(), pos: [-1.2, 0, 0], scale: 1 }),
			Cube({ colour: randomCubeColour(), pos: [0, 1.2, 0], scale: 2 }),
		]);
		console.log("MVIEW " + JSON.stringify(model));
	}, []);

	//WHY THE FUCK WONT THIS FUCKING WORK OH MY FUCKING GOD
	return (
		<>
			<div className="flex flex-row min-w-full h-dvh flex-shrink overflow-hidden bg-red-300 flex-nowrap items-start justify-center">
				<div
					id="leftSidebar"
					className="w-96 h-auto flex flex-col bg-slate-800 items-center justify-center">
					<ModelContextProvider data={{ model: model, set: setModel }}>
						<ModelPartView />
					</ModelContextProvider>
					{"remove StrictMode from main.tsx to stop incorrect ID ( for testing only)"}
				</div>

				<div
					id="viewportContainer"
					className="w-full h-full flex flex-shrink bg-slate-900 items-center justify-center overflow-hidden">
					<ModelContextProvider data={{ model: model, set: setModel }}>
						<Viewport />
					</ModelContextProvider>
				</div>

				<div
					id="rightSidebar"
					className="w-24 h-max bg-slate-800 items-center justify-center"></div>
			</div>
			<div
				id="bottomBar"
				className="w-full h-12 bg-slate-800 items-center justify-center absolute bottom-0  overflow-hidden">
				<h2 className="text-white">Bottom Bar</h2>
			</div>
		</>
	);
}

export default ModelView;

import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as THREE from "three";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera } from "@react-three/drei";
import Viewport from "./components/Viewport";

function ModelView() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);
	//WHY THE FUCK WONT THIS FUCKING WORK OH MY FUCKING GOD
	return (
		<>
			<div className="flex flex-row min-w-full h-dvh flex-shrink overflow-hidden bg-red-300 flex-nowrap items-center justify-center">
				<div
					id="leftSidebar"
					className="w-24 h-auto flex bg-slate-800 items-center justify-center"></div>

				<div
					id="viewportContainer"
					className="w-full h-full flex flex-shrink bg-slate-900 items-center justify-center overflow-hidden">
					<Viewport />
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

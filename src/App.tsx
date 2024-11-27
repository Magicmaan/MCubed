import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as THREE from "three";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera } from "@react-three/drei";
import Viewport from "./components/Viewport";

function App() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);

	return (
		<>
			<div className="flex flex-row w-full h-80 bg-red-500 flex-nowrap items-center justify-center">
				<a href="https://vite.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>

			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>

			<div className="bg-black  p-4">
				<p className="text-5xl  font-bold text-red-900">Hello, Tailwind CSS!</p>
			</div>

			<div className="w-screen h-10" />
			<Viewport />
		</>
	);
}

export default App;

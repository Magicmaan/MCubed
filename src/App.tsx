import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as THREE from "three";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera } from "@react-three/drei";
import Viewport from "./components/Viewport";
import ModelView from "./ModelView";
import NavBar from "./components/NavBar";

function App() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);

	const [currentView, setCurrentView] = useState(<ModelView />);

	return (
		<>
			<NavBar />
			{currentView}
		</>
	);
}

export default App;

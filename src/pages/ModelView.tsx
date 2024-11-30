import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "../styles/App.css";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera } from "@react-three/drei";
import Viewport from "../components/Viewport";
import Cube from "../primitives/Cube.tsx";
import { CubeProps } from "../primitives/Cube.tsx";
import { modelContext, ModelContextProvider } from "../context/ModelContext";
import {
	defaultViewportContext,
	ViewportContextProvider,
} from "../context/ViewportContext";
import ModelPartView from "../components/ModelPartView";
import { randomCubeColour } from "../constants/CubeColours.tsx";
import ContextMenu from "../components/ContextMenu.tsx";
import useContextMenu from "../hooks/useContextMenu.tsx";
import CubePartView from "../components/CubePartView.tsx";

function ModelView() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);
	const [model, setModel] = React.useState<CubeProps[]>([]);
	const { menuVisible, menuItems, menuPosition, showMenu, hideMenu, handleContextMenu } =
		useContextMenu();

	const [viewportSettings, setViewportSettings] = React.useState(defaultViewportContext);

	React.useEffect(() => {
		setModel([
			Cube({ colour: randomCubeColour(), pos: [1.2, 0, 0], scale: 0.5 }),
			Cube({ colour: randomCubeColour(), pos: [-1.2, 0, 0], scale: 1 }),
			Cube({ colour: randomCubeColour(), pos: [0, 1.2, 0], scale: 2 }),
		]);
	}, []);

	return (
		<React.Fragment>
			<div className="flex flex-row min-w-full h-lvh overflow-y-hidden flex-shrink overflow-hidden bg-blue-400 flex-nowrap items-start justify-center">
				<div
					id="leftSidebar"
					className="w-96 h-auto flex flex-col bg-blue-400 items-center justify-center m-1 rounded  space-y-36">
					<ModelContextProvider data={{ model: model, set: setModel }}>
						<ModelPartView />
					</ModelContextProvider>

					<ModelContextProvider data={{ model: model, set: setModel }}>
						<CubePartView />
					</ModelContextProvider>

					{"remove StrictMode from main.tsx to stop incorrect ID ( for testing only)"}
				</div>

				<div
					id="viewportContainer"
					className="w-full h-full flex flex-shrink bg-slate-900 items-center justify-center overflow-hidden">
					<ViewportContextProvider data={viewportSettings}>
						<ModelContextProvider data={{ model: model, set: setModel }}>
							<Viewport />
						</ModelContextProvider>
					</ViewportContextProvider>
				</div>

				<div
					id="rightSidebar"
					onContextMenu={handleContextMenu}
					className="w-24 h-max bg-slate-800 items-center justify-center">
					<ContextMenu visible={menuVisible} items={menuItems} position={menuPosition} />
				</div>
			</div>
			<div
				id="bottomBar"
				onContextMenu={handleContextMenu}
				className="w-full h-12 bg-slate-800 items-center justify-center absolute bottom-0  overflow-hidden">
				<h2 className="text-white">Bottom Bar</h2>
			</div>
		</React.Fragment>
	);
}

export default ModelView;

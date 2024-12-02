import { useState } from "react";
import { lazy } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "../styles/App.css";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Hud, PerspectiveCamera } from "@react-three/drei";
import Cube from "../primitives/Cube.tsx";
import { CubeProps } from "../primitives/Cube.tsx";
import {
	modelContext,
	ModelContextProvider,
} from "../components/Viewport/ModelContext.tsx";
import {
	defaultViewportContext,
	ViewportContextProvider,
} from "../components/Viewport/ViewportContext";
import ModelPartView from "../components/ModelPartView";
import { randomCubeColour } from "../constants/CubeColours.tsx";
import ContextMenu from "../components/ContextMenu.tsx";
import useContextMenu from "../hooks/useContextMenu.tsx";
import CubePartView from "../components/CubePartView.tsx";

const Viewport = lazy(() => import("../components/Viewport/Viewport.tsx"));
function ModelView() {
	const [model, setModel] = React.useState<CubeProps[]>([]);
	const [selected, setSelected] = React.useState<Number[]>([]);
	const [sceneRef, setSceneRef] = React.useState<THREE.Scene | null>(null);
	// https://github.com/pmndrs/drei/blob/master/src/web/Select.tsx
	// look at this to improve
	const { menuVisible, menuItems, menuPosition, showMenu, hideMenu, handleContextMenu } =
		useContextMenu();
	const [viewportSettings, setViewportSettings] = React.useState(defaultViewportContext);
	React.useEffect(() => {
		setModel([Cube({ colour: randomCubeColour(), pos: [9, 0, 0], scale: 1 })]);
		setSelected([1]);
	}, []);

	return (
		<React.Fragment>
			<div className="flex flex-row min-w-full h-full overflow-y-hidden flex-shrink overflow-hidden bg-blue-400 flex-nowrap items-start justify-center">
				<div
					id="leftSidebar"
					className="w-96 h-full flex flex-col bg-blue-400 items-stretch justify-center m-1 rounded  space-y-2">
					<ModelContextProvider
						data={{
							model: model,
							set: setModel,
							selected: selected,
							setSelected: setSelected,
							sceneRef: sceneRef,
						}}>
						<ModelPartView />
					</ModelContextProvider>

					<ModelContextProvider
						data={{
							model: model,
							set: setModel,
							selected: selected,
							setSelected: setSelected,
							sceneRef: sceneRef,
						}}>
						<CubePartView />
					</ModelContextProvider>

					{"remove StrictMode from main.tsx to stop incorrect ID ( for testing only)"}
				</div>

				<div
					id="viewportContainer"
					className="w-full h-full flex flex-shrink bg-slate-900 items-center justify-center">
					<ViewportContextProvider data={viewportSettings}>
						<ModelContextProvider
							data={{
								model: model,
								set: setModel,
								selected: selected,
								setSelected: setSelected,
								sceneRef: sceneRef,
								setSceneRef: setSceneRef,
							}}>
							<React.Suspense fallback={<div>Loading...</div>}>
								<Viewport />
							</React.Suspense>
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
				className="w-full h-12 bg-slate-800 items-center justify-center overflow-hidden">
				<h2 className="text-white">Bottom Bar</h2>
			</div>
		</React.Fragment>
	);
}

export default ModelView;

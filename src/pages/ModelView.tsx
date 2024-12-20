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
import CubePartView from "../components/CubePartView";
import { is } from "@react-three/fiber/dist/declarations/src/core/utils";
import { useAppSelector } from "../hooks/useRedux.tsx";
import ResizeableBar from "../components/ResizeableBar.tsx";
import SideBarWidget from "../components/templates/SideBarWidget.tsx";
import TextureCanvasView from "../components/TextureCanvasView.tsx";

const Viewport = lazy(() => import("../components/Viewport/Viewport.tsx"));
function ModelView() {
	const [model, setModel] = React.useState<CubeProps[]>([]);
	const [selected, setSelected] = React.useState<Number[]>([]);
	const [sceneRef, setSceneRef] = React.useState<THREE.Scene | null>(null);

	// https://github.com/pmndrs/drei/blob/master/src/web/Select.tsx
	// look at this to improve
	const { menuVisible, menuItems, menuPosition, showMenu, hideMenu, handleContextMenu } =
		useContextMenu();

	React.useEffect(() => {
		setModel([
			Cube({ colour: randomCubeColour(), pos: [9, 0, 0], scale: 1, size: [16, 16, 16] }),
		]);
		setSelected([1]);
	}, []);

	//REDUX STUFF
	const mesh = useAppSelector((state) => state.mesh);
	console.log("App mesh data ", mesh);

	return (
		<div className="w-screen h-full flex flex-col flex-grow-0 overflow-hidden">
			<div className="flex flex-row w-screen h-full overflow-y-hidden flex-grow overflow-hidden  flex-nowrap items-center justify-stretch p-1 gap-1">
				<ResizeableBar
					id="leftSidebar"
					width={300}
					resizable={[false, false, true, false]}
					className="h-full min-w-10 flex flex-col bg-secondary items-stretch justify-stretch rounded-xl space-y-2 flex-shrink-0">
					<ModelPartView />
					<CubePartView />
				</ResizeableBar>

				<div
					id="viewportContainer"
					className="w-auto h-auto flex flex-grow self-stretch items-stretch justify-stretch overflow-clip rounded-md  border-4 border-secondary">
					<React.Suspense fallback={<div>Loading...</div>}>
						<div className="w-full h-full">
							<Viewport />
							<div className="-z-10 relative bottom-full w-full h-full viewportBackground pointer-events-none select-none "></div>
						</div>
					</React.Suspense>
				</div>

				<ResizeableBar
					id="rightSidebar"
					width={300}
					resizable={[true, false, false, false]}
					className="h-full min-w-10 flex flex-col bg-secondary items-stretch justify-stretch rounded-xl space-y-2 flex-shrink-0">
					<TextureCanvasView />
				</ResizeableBar>
			</div>

			{/* <ResizeableBar
				id="bottomBar"
				width={200}
				resizable={[true, false, false, false]}
				className="h-full min-w-10 flex flex-col bg-secondary items-stretch justify-center rounded-xl space-y-2 flex-shrink-0">
				<ContextMenu visible={menuVisible} items={menuItems} position={menuPosition} />
			</ResizeableBar> */}
			<div
				id="bottomBar"
				onContextMenu={handleContextMenu}
				className="w-full h-12 bg-slate-800 items-center justify-center overflow-hidden flex-shrink-0">
				<h2 className="text-white">Bottom Bar</h2>
			</div>
		</div>
	);
}

export default ModelView;

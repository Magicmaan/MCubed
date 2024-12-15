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
import { is } from "@react-three/fiber/dist/declarations/src/core/utils";
import { useAppSelector } from "../hooks/useRedux.tsx";

const SideBar: React.FC<{
	id?: string;
	width?: number;
	resizable: [boolean, boolean, boolean, boolean];
	children: React.ReactNode;
}> = ({ children, id, width = 96, resizable }) => {
	const [isResizing, setIsResizing] = useState(false);
	const handleMouseMove = (e: MouseEvent) => {
		if (!isResizing) return;
		// use requestAnimationFrame to throttle the events to stop lag
		requestAnimationFrame(() => {
			const div = document.getElementById(id);
			if (div) {
				var newWidth = e.clientX - div.getBoundingClientRect().left + 5;
				if (resizable[2] || resizable[3]) {
					div.style.width = `${newWidth}px`;
				}
			}
		});
	};
	const handleMouseUp = () => {
		setIsResizing(false);
	};
	React.useEffect(() => {
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing]);

	return (
		<div
			id={id}
			onMouseOver={(e) => {
				var div = e.currentTarget;
				var width = div.offsetWidth;
				var height = div.offsetHeight;
				var x = e.clientX - div.getBoundingClientRect().left;
				var y = e.clientY - div.getBoundingClientRect().top;
				const isBorder =
					(resizable[2] && x <= 5) ||
					(resizable[0] && y <= 5) ||
					(resizable[3] && x >= width - 5) ||
					(resizable[1] && y >= height - 5);
				if (isBorder) {
					div.style.cursor = "ew-resize";
				} else {
					div.style.cursor = "default";
				}
			}}
			onMouseDown={(e) => {
				var div = e.currentTarget;
				var width = div.offsetWidth;
				var height = div.offsetHeight;
				var x = e.clientX - div.getBoundingClientRect().left;
				var y = e.clientY - div.getBoundingClientRect().top;
				const isBorder =
					(resizable[2] && x <= 10) ||
					(resizable[0] && y <= 10) ||
					(resizable[3] && x >= width - 10) ||
					(resizable[1] && y >= height - 10);
				if (isBorder) {
					div.style.cursor = "ew-resize";
					setIsResizing(true);
				}
			}}
			onMouseUp={() => setIsResizing(false)}
			style={{ width: `${width}px`, resize: "horizontal" }}
			className={`transition-border duration-100  select-text h-full min-w-10 flex flex-col bg-secondary items-stretch justify-center rounded-xl space-y-2 flex-shrink-0 ${
				(isResizing ? "select-none  border-highlight-300 border-8 p-2 " : "") +
				(resizable[3] ? "border-r-highlight-100" : "") +
				(resizable[2] ? "border-l-highlight-100" : "") +
				(resizable[0] ? "border-t-highlight-100" : "") +
				(resizable[1] ? "border-b-highlight-100" : "")
			}`}>
			{children}
			<div className="w-full h-full"></div>
		</div>
	);
};

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
		<div className="w-full h-full flex flex-col flex-grow-0 overflow-hidden">
			<div className="flex flex-row w-full h-full overflow-y-hidden flex-grow overflow-hidden bg-red-500 flex-nowrap items-center justify-stretch p-1 gap-1">
				<SideBar id="leftSidebar" width={300} resizable={[false, false, false, true]}>
					<ModelPartView />

					<CubePartView />

					{"remove StrictMode from main.tsx to stop incorrect ID ( for testing only)"}
				</SideBar>

				<div
					id="viewportContainer"
					className="w-auto h-auto flex flex-grow self-stretch items-stretch bg-slate-900 justify-stretch overflow-hidden rounded-md p-1">
					<React.Suspense fallback={<div>Loading...</div>}>
						<Viewport />
					</React.Suspense>
				</div>

				<SideBar id="rightSidebar" width={200} resizable={[false, false, true, false]}>
					<ContextMenu visible={menuVisible} items={menuItems} position={menuPosition} />
				</SideBar>
			</div>
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

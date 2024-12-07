import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";
import { BoxGeometry } from "three";
import * as React from "react";
import { Canvas, useFrame, useThree, getRootState, RootState } from "@react-three/fiber";
import { useEffect } from "react";
import {
	OrbitControls,
	Hud,
	PerspectiveCamera,
	Grid,
	Outlines,
	Html,
	Box,
} from "@react-three/drei";
import { modelContext, useModelContext } from "./ModelContext";
import { CubeProps } from "../../primitives/Cube";
import { useViewportContext } from "./ViewportContext";
import { Stats } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { color } from "three/webgpu";
import Icon from "../../assets/icons/solid/.all";
import icon from "../assets/arrow.png";
import { PivotControls } from "../custom_PivotControl";
import { createTexture } from "../../util/textureUtil";
import GridPlane from "./GridPlane";
import SideBarWidget from "../templates/SideBarWidget";
import { useAppSelector, useMeshSelector } from "../../hooks/useRedux";
import PivotControlsComponent from "./PivotControlsComponent";

// TODO
// create custom camera component
// - implement camera controls
// - add context to control camera

// Simplify PivotControls
// - remove unnecessary code
// - make it more readable
// - implement interaction with outside components

// function CubeMesh(
// 	cube: CubeProps,
// 	isSelected: boolean,
// 	setSelected: React.Dispatch<React.SetStateAction<[number]>>,
// 	useGimbal: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
// ) {
// 	if (isSelected) {
// 		console.log("Selected from VPort");
// 	}
// 	if (cube.cubeMesh) {
// 		cube.cubeMesh = React.cloneElement(cube.cubeMesh, {
// 			onClick: (e: any) => {
// 				const { id, name, color } = e.object.userData;
// 				console.log(`Clicked ${name} with id ${id} and color ${color} MODIFIED BEFORE`);
// 				setSelected([parseInt(id)]);
// 			},
// 		});
// 	}
// 	return (
// 		// <PivotControls
// 		// 	onDragStart={(e) => {
// 		// 		useGimbal[1](false);
// 		// 	}}
// 		// 	onDragEnd={() => {
// 		// 		useGimbal[1](true);
// 		// 	}}
// 		// 	anchor={[0, 0, 0]}
// 		// 	scale={2}
// 		// 	rotation={[0, 0, 0]}
// 		// 	depthTest={false}
// 		// 	enabled={isSelected}>
// 		<>{cube.cubeMesh}</>
// 		// </PivotControls>
// 	);
// }

// function unpackModel(
// 	model: CubeProps[],
// 	selected: Number[],
// 	setSelected: React.Dispatch<React.SetStateAction<[number]>>,
// 	useGimbal: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
// ) {
// 	let unpackedModel: React.ReactNode[] = [];
// 	model.forEach((item: CubeProps) => {
// 		var isSelected = selected.includes(item.id);
// 		unpackedModel.push(CubeMesh(item, isSelected, setSelected, useGimbal));
// 	});
// 	return unpackedModel;
// }

const GetSceneRef: React.FC<{
	setRef: React.Dispatch<
		React.SetStateAction<React.MutableRefObject<THREE.Scene | null>>
	>;
	setThree: React.Dispatch<React.SetStateAction<RootState | undefined>>;
	invalidate: React.MutableRefObject<(arg0: number) => void>;
}> = ({ setRef, setThree, invalidate }) => {
	const { scene, camera } = useThree();
	const threeScene = useThree();
	setRef(scene);
	setThree(threeScene);
	invalidate.current = threeScene.invalidate;
	return null;
};

const Viewport: React.FC = () => {
	const _viewport = useViewportContext();
	const camera = _viewport.cameraSettings;
	const viewportContainer = useState<HTMLDivElement | null>(
		document.getElementById("viewportContainer") as HTMLDivElement
	);

	var invalidate = React.useRef<(arg0: number) => void>(() => {});
	const { model, selected, setSelected, sceneRef, setSceneRef } = useModelContext();
	//const [modelData, setModelData] = React.useState<React.ReactNode[]>([]);
	const modelData = null; //useMeshSelector();
	const [threeScene, setThreeScene] = useState<RootState>();
	const useGimbal = useState(true);

	const handleSelection = React.useCallback(() => {
		//TODO
	}, [selected]);
	useEffect(() => {
		handleSelection();
	}, [handleSelection]);

	// handle resizing of the viewport container
	const boxRef = React.useRef<THREE.Mesh>(null);
	const boxRef2 = React.useRef<THREE.Mesh>(null);
	const pivotMatrix = new THREE.Matrix4();

	var preMatrix = new THREE.Matrix4();
	var preMatrixInv = new THREE.Matrix4();

	return (
		<div style={{ position: "relative", width: "100%", height: "100%" }}>
			<Canvas
				id="viewport"
				frameloop="demand"
				className="w-full h-full pattern-1 "
				camera={{ fov: camera.fov, position: camera.pos }}>
				<GetSceneRef
					setRef={setSceneRef}
					setThree={setThreeScene}
					invalidate={invalidate}
				/>
				<PerspectiveCamera
					makeDefault
					aspect={
						(viewportContainer[0]?.clientWidth || 1) /
						(viewportContainer[0]?.clientHeight || 1)
					}
					fov={camera.fov}
					position={camera.pos}
					manual={true}></PerspectiveCamera>
				<ambientLight intensity={0.5} />

				{/* the model */}
				{modelData}

				<GridPlane size={32} />
				<OrbitControls
					enableZoom={useGimbal[0]}
					enablePan={useGimbal[0]}
					enableRotate={useGimbal[0]}
				/>
				<Stats />

				<PivotControlsComponent useGimbal={useGimbal} selected={boxRef2} />

				<group ref={boxRef2} matrixAutoUpdate={false}>
					<Box
						matrixAutoUpdate={false}
						args={[2, 2, 2]}
						material={new THREE.MeshBasicMaterial({ color: "red" })}
					/>
				</group>
			</Canvas>
			<InfoPanel />
		</div>
	);
};

const InfoPanel: React.FC = () => {
	const [showInfo, setShowInfo] = useState(false);

	return (
		<div className="absolute top-2 left-2 right-2 bottom-2 bg-primary items-start justify-start p-20 pointer-events-none">
			<div
				className={
					"pointer-events-auto transition-all duration-100  absolute right-0 aria-expanded:scale-0 scale-100 top-0 w-9 aspect-square bg-primary flex items-center justify-center bg-blue-500 rounded-full hover:border-2 border-highlight-200"
				}
				aria-expanded={showInfo}
				onClick={() => {
					setShowInfo(!showInfo);
					console.log("press");
				}}>
				<Icon
					name="question"
					center_x
					height={20}
					width={20}
					colour="red"
					alt_text="increment"
				/>
			</div>
			<div
				aria-expanded={showInfo}
				className={
					" pointer-events-auto transition-all duration-800 absolute right-2 top-2 w-52 h-auto bg-primary flex items-center justify-center hover:border-2 border-highlight-200 scale-0 aria-expanded:scale-100 aria-expanded:rounded-xl aria-expanded:top-0 aria-expanded:right-0 origin-top-right"
				}>
				<SideBarWidget name="Info" showExitButton onExit={() => setShowInfo(!showInfo)}>
					<div className="flex flex-col space-y-2">
						<h2>Camera</h2>
						<div className="flex flex-row space-x-2 pl-2">
							<p className=" text-sm">Position</p> X Y Z
						</div>
						<div className="flex flex-row space-x-2 pl-2">
							<p className=" text-sm">Angle</p> X Y Z
						</div>
						<div className="flex flex-row space-x-2 pl-2">
							<p className=" text-sm">Pivot</p> X Y Z
						</div>

						<div className="flex flex-row space-x-2 pl-2">
							<p className=" text-sm">Fov</p>
						</div>
					</div>
				</SideBarWidget>
			</div>
		</div>
	);
};

export default Viewport;

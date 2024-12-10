import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";

import { BoxGeometry } from "three";
import * as React from "react";
import {
	Canvas,
	useFrame,
	useThree,
	getRootState,
	RootState,
	Vector3,
} from "@react-three/fiber";

import {
	OrbitControls,
	Hud,
	PerspectiveCamera,
	Grid,
	Outlines,
	Html,
	Box,
	Sphere,
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
import {
	useAppDispatch,
	useAppSelector,
	useMeshSelector,
	useViewportSelector,
} from "../../hooks/useRedux";
import PivotControlsComponent from "./PivotControlsComponent";
import { current } from "@reduxjs/toolkit";
import InputSingle from "../ValueDisplay";
import { toTrun, toTrunPercentage } from "../../util";
import InfoPanel from "./InfoPanel";

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

const useSmoothedValue = (value: number, smoothingFactor: number = 0.1) => {
	const [smoothedValue, setSmoothedValue] = useState(value);

	useEffect(() => {
		const interval = setInterval(() => {
			setSmoothedValue((prev) => prev + (value - prev) * smoothingFactor);
		}, 100); // Update every 100ms

		return () => clearInterval(interval);
	}, [value, smoothingFactor]);

	return smoothedValue;
};

const GetSceneRef: React.FC<{
	setRef: React.Dispatch<
		React.SetStateAction<React.MutableRefObject<THREE.Scene | null>>
	>;
	setThree: React.Dispatch<React.SetStateAction<RootState | undefined>>;
	invalidate: React.MutableRefObject<(arg0: number) => void>;
}> = ({ setRef, setThree, invalidate }) => {
	const { scene, camera } = useThree();

	const threeScene = useThree();

	useEffect(() => {
		const interval = setInterval(() => {
			setRef(scene);
			setThree(threeScene);
			invalidate.current = threeScene.invalidate;
		}, 1000); // Refresh every 1 second

		return () => clearInterval(interval); // Cleanup on unmount
	}, [scene, threeScene, setRef, setThree, invalidate]);

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
	const modelData = useMeshSelector();
	const viewportData = useViewportSelector();
	const [threeScene, setThreeScene] = useState<RootState>();
	const useGimbal = viewportData.useGimbal;
	const showGrid = viewportData.showGrid;
	const showStats = viewportData.showStats;
	const dispatch = useAppDispatch();

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

	const cameraRef = React.useRef<THREE.PerspectiveCamera>(null);

	const orbitRef = React.useRef<typeof OrbitControls & { target: THREE.Vector3 }>(null!);
	const cameraPivot = React.useRef<THREE.Vector3>(
		orbitRef.current?.target ?? new THREE.Vector3(0, 0, 0)
	);
	const pivotPointRef = React.useRef<THREE.Mesh>(null);
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
					manual={true}
					ref={cameraRef}></PerspectiveCamera>
				<ambientLight intensity={0.5} />

				{/* the model */}
				{/* {modelData} */}

				{showGrid ? <GridPlane size={16} /> : null}
				<OrbitControls
					enableZoom={useGimbal?.zoom}
					enablePan={useGimbal?.pan}
					enableRotate={useGimbal?.rotate}
					ref={orbitRef}
					onStart={() => {
						pivotPointRef.current?.position.copy(cameraPivot.current);
					}}
					onChange={(e) => {
						invalidate.current();
					}}
					onEnd={() => {
						cameraPivot.current = orbitRef.current?.target;

						pivotPointRef.current?.position.copy(cameraPivot.current);
					}}
					target={cameraPivot.current}
				/>
				<Sphere ref={pivotPointRef} args={[0.5, 32, 32]} position={[0, 0, 0]} />

				{showStats && <Stats className=" text-lg bg-red-500" />}

				<PivotControlsComponent useGimbal={useGimbal} selected={boxRef2} />

				<group ref={boxRef2} matrixAutoUpdate={false}>
					<Box
						matrixAutoUpdate={false}
						args={[2, 2, 2]}
						material={new THREE.MeshBasicMaterial({ color: "red" })}
					/>
				</group>
			</Canvas>
			<InfoPanel
				scene={threeScene}
				camera={cameraRef}
				pivot={cameraPivot}
				useGimbal={useGimbal}
			/>
		</div>
	);
};

export default Viewport;

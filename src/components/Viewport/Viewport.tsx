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
	ThreeEvent,
	InstancedMeshProps,
	invalidate,
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
	InstancedAttribute,
	useCubeTexture,
	Facemesh,
} from "@react-three/drei";
import { modelContext, useModelContext } from "./ModelContext";
import CubeMesh, { CubeProps, GroupProps, THREEObjectProps } from "../../primitives/Cube";
import { useViewportContext } from "./ViewportContext";
import { Stats } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { createTexture, loadTexture } from "../../util/textureUtil";
import GridPlane from "./GridPlane";
import SideBarWidget from "../templates/SideBarWidget";
import {
	useAppDispatch,
	useAppSelector,
	useMeshArraySelector,
	useMeshSelector,
	useViewportSelector,
} from "../../hooks/useRedux";
import PivotControlsComponent from "./PivotControlsComponent";
import InputSingle from "../ValueDisplay";
import { toTrun, toTrunPercentage } from "../../util";
import InfoPanel from "./InfoPanel";
import { setScene } from "../../reducers/viewportReducer";

const GetSceneRef: React.FC<{
	setRef: React.Dispatch<
		React.SetStateAction<React.MutableRefObject<THREE.Scene | null>>
	>;
	setThree: React.Dispatch<React.SetStateAction<RootState | undefined>>;
	invalidate: React.MutableRefObject<(arg0: number) => void>;
}> = ({ setRef, setThree, invalidate }) => {
	const dispatch = useAppDispatch();
	const threeScene = useThree();
	const rawscene = threeScene.scene.children;

	console.log("Setting scene ref");
	console.log("Scene: ", rawscene);

	return <></>;
};

const ModelInstance: React.FC<{
	count: number;
	temp?: THREE.Object3D;
	modelData: CubeProps[];
	selectRef: React.RefObject<THREE.Mesh | null>;
}> = ({ count = 20, temp = new THREE.Object3D(), modelData, selectRef }) => {
	const selectedID = React.useRef<number | null>(null);
	const instancedMeshRef = React.useRef<THREE.InstancedMesh>(null);

	const textures = React.useMemo(
		() => [
			loadTexture("/src/assets/textures/s3.png"),
			loadTexture("/src/assets/textures/s2.png"),
			loadTexture("/src/assets/textures/s5.png"), //up
			loadTexture("/src/assets/textures/s4.png"), //down
			loadTexture("/src/assets/textures/s1.png"),
			loadTexture("/src/assets/textures/s6.png"),
		],
		[]
	);

	const materials = React.useMemo(
		() => [
			new THREE.MeshBasicMaterial({ map: textures[0] }),
			new THREE.MeshBasicMaterial({ map: textures[1] }),
			new THREE.MeshBasicMaterial({ map: textures[2] }),
			new THREE.MeshBasicMaterial({ map: textures[3] }),
			new THREE.MeshBasicMaterial({ map: textures[4] }),
			new THREE.MeshBasicMaterial({ map: textures[5] }),
		],
		[textures]
	);

	const handleClick = (event: ThreeEvent<MouseEvent>) => {
		const instanceId = event.instanceId;
		if (instanceId !== undefined) {
			console.log(`Cube ${instanceId} clicked`);
			selectedID.current = instanceId;
		}
	};

	useFrame(() => {
		console.log("INSTANCE FRAME");
		for (let i = 0; i < count; i++) {
			if (selectedID.current === i) {
				if (selectRef.current?.matrixWorld) {
					temp.position.setFromMatrixPosition(selectRef.current.matrixWorld);
					temp.rotation.setFromRotationMatrix(selectRef.current.matrixWorld);
				}
				temp.scale.set(
					modelData[i].size[0] * modelData[i].scale,
					modelData[i].size[1] * modelData[i].scale,
					modelData[i].size[2] * modelData[i].scale
				);
				temp.updateMatrix();
				instancedMeshRef.current?.setMatrixAt(i, temp.matrix);
			}
		}
		if (instancedMeshRef.current) {
			instancedMeshRef.current.instanceMatrix.needsUpdate = true;
		}
	});

	useEffect(() => {
		// Set positions
		for (let i = 0; i < count; i++) {
			temp.position.set(
				modelData[i].position[0],
				modelData[i].position[1],
				modelData[i].position[2]
			);
			temp.rotation.set(
				modelData[i].rotation[0],
				modelData[i].rotation[1],
				modelData[i].rotation[2]
			);
			temp.scale.set(
				modelData[i].size[0] * modelData[i].scale,
				modelData[i].size[1] * modelData[i].scale,
				modelData[i].size[2] * modelData[i].scale
			);
			temp.updateMatrix();
			instancedMeshRef.current?.setMatrixAt(i, temp.matrix);
		}
		if (instancedMeshRef.current) {
			instancedMeshRef.current.instanceMatrix.needsUpdate = true;
		}
	}, []);

	return (
		<instancedMesh
			ref={instancedMeshRef}
			args={[undefined, undefined, count]}
			onClick={handleClick}
			onUpdate={(self) => {
				console.log("InstancedMesh onUpdate");
			}}>
			<boxGeometry />
			<meshBasicMaterial attach="material-0" map={textures[0]} />
			<meshBasicMaterial attach="material-1" map={textures[1]} />
			<meshBasicMaterial attach="material-2" map={textures[2]} />
			<meshBasicMaterial attach="material-3" map={textures[3]} />
			<meshBasicMaterial attach="material-4" map={textures[4]} />
			<meshBasicMaterial attach="material-5" map={textures[5]} />
		</instancedMesh>
	);
};

const Viewport: React.FC = () => {
	const _viewport = useViewportContext();
	const camera = _viewport.cameraSettings;
	const viewportContainer = useState<HTMLDivElement | null>(
		document.getElementById("viewportContainer") as HTMLDivElement
	);

	var invalidate = React.useRef<(arg0: number) => void>(() => {});
	const { model, sceneRef, setSceneRef } = useModelContext();
	const [threeScene, setThreeScene] = useState<RootState>();

	const viewportData = useViewportSelector();
	const useGimbal = viewportData.useGimbal;
	const showGrid = viewportData.showGrid;
	const showStats = viewportData.showStats;
	const selected = viewportData.selected;
	const dispatch = useAppDispatch();

	const meshStore = useMeshSelector();
	const meshProps = meshStore.mesh;

	const boxRef = React.useRef<THREE.Mesh>(null);
	const selectedRef = React.useRef<THREE.Mesh | null>(null);
	const texture = React.useMemo(() => {
		return loadTexture("/src/assets/textures/s1.png");
	}, []);

	const modelData = React.useMemo(() => {
		console.log("assembling model");

		return meshProps.map((item) => {
			const copiedItem: THREEObjectProps = {
				...item,
				ref: boxRef,
				texture: texture,
				onClick: (e: ThreeEvent<MouseEvent>) =>
					(selectedRef.current = e.eventObject as THREE.Mesh),
			};
			return CubeMesh(copiedItem as CubeProps);
		});
	}, [meshProps]);

	console.log("Model data: ", modelData);

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
				camera={{ fov: camera.fov, position: camera.pos }}
				gl={{
					antialias: true,
					toneMapping: THREE.NoToneMapping,
				}}>
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
					manual={false}
					ref={cameraRef}></PerspectiveCamera>
				<ambientLight />
				<pointLight position={[10, 10, 10]} />

				<ModelInstance
					modelData={meshProps}
					count={meshProps.length}
					selectRef={selectedRef}
				/>

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
					onUpdate={(self) => {
						console.log("OrbitControls onUpdate");
						console.log(self);
					}}
					target={cameraPivot.current}
				/>
				<Sphere ref={pivotPointRef} args={[0.5, 32, 32]} position={[0, 0, 0]} />

				{showStats && <Stats className=" text-lg bg-red-500" />}

				<PivotControlsComponent useGimbal={useGimbal} selected={selectedRef} />
				<group ref={selectedRef} matrixAutoUpdate={false} />
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

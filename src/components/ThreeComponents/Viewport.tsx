import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";

import { BoxGeometry, Raycaster } from "three";
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
	Circle,
	ScreenSpace,
} from "@react-three/drei";

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
	useMeshDataSelector,
	useMeshStoreSelector,
	useViewportCameraSelector,
	useViewportCameraSettingsSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from "../../hooks/useRedux";
import PivotControlsComponent from "./PivotControlsComponent";
import InputSingle from "../ValueDisplay";
import { toTrun, toTrunPercentage } from "../../util";
import InfoPanel from "./Gui/InfoPanel";
import { setControls, setScene, setSelected } from "../../reducers/viewportReducer";
import ModelInstance from "./ModelInstance";

const GetSceneRef: React.FC<{
	setThree: React.Dispatch<React.SetStateAction<RootState | undefined>>;
}> = ({ setThree }) => {
	const dispatch = useAppDispatch();
	const threeScene = useThree();
	setThree(threeScene);
	//console.log("Setting scene ref");
	//console.log("Scene: ", rawscene);

	return <></>;
};

const Viewport: React.FC = () => {
	const viewportContainer = useState<HTMLDivElement | null>(
		document.getElementById("viewportContainer") as HTMLDivElement
	);

	const isUsingCamera = React.useRef(false);
	const [threeScene, setThreeScene] = useState<RootState>();

	const viewportData = useViewportSelector();
	const cameraControls = useViewportCameraSelector();
	const showGrid = viewportData.showGrid;
	const showStats = viewportData.showStats;
	const selected = useViewportSelectedSelector();
	const dispatch = useAppDispatch();

	const camera = useViewportCameraSettingsSelector();

	const meshStore = useMeshStoreSelector();
	const meshData = useMeshDataSelector();

	const boxRef = React.useRef<THREE.Mesh>(null);
	const selectionAnchorRef = React.useRef<THREE.Group | null>(null);
	const texture = React.useMemo(() => {
		return loadTexture("/src/assets/textures/s1.png");
	}, []);

	const cameraRef = React.useRef<THREE.PerspectiveCamera>(null);

	const orbitRef = React.useRef<typeof OrbitControls & { target: THREE.Vector3 }>(null!);
	const cameraPivot = React.useRef<THREE.Vector3>(
		orbitRef.current?.target ?? new THREE.Vector3(0, 0, 0)
	);
	const pivotPointRef = React.useRef<THREE.Group>(null);

	const setPivotPosition = (position: THREE.Vector3) => {
		cameraPivot.current.copy(position);
		if (pivotPointRef.current) {
			pivotPointRef.current.position.copy(position);
		}
	};

	const raycaster = new THREE.Raycaster();

	// useFrame(() => {
	// 	console.log("Hi");
	// });

	return (
		<Canvas
			id="viewport"
			frameloop="always"
			className="w-full h-full bg-transparent "
			camera={{ fov: camera.fov, position: camera.pos }}
			gl={{
				antialias: true,
				toneMapping: THREE.NoToneMapping,
			}}
			onMouseDown={(e) => {
				//console.log("Canvas onMouseDown");
				isUsingCamera.current = true;
			}}
			onMouseEnter={(e) => {
				dispatch(setControls({ zoom: true, pan: true, rotate: true }));
			}}
			onMouseLeave={(e) => {
				// if dragging
				if (isUsingCamera.current) {
					console.log("Canvas onMouseLeave but dragging");
				} else {
					console.log("Canvas onMouseLeave");
					dispatch(setControls({ zoom: false, pan: false, rotate: false }));
				}
			}}
			onPointerMove={(e) => {
				invalidate();
			}}
			onPointerMissed={(e) => {
				console.log("Canvas onPointerMissed");
				dispatch(setSelected(-1));
				console.log("Selected: ", selected);
				invalidate();
			}}>
			<GetSceneRef setThree={setThreeScene} />
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

			<ModelInstance selectionAnchorRef={selectionAnchorRef} />

			<GridPlane size={16} />
			<OrbitControls
				enableZoom={cameraControls?.zoom}
				enablePan={cameraControls?.pan}
				enableRotate={cameraControls?.rotate}
				ref={orbitRef}
				onStart={() => {
					//cameraPivot.current = orbitRef.current?.target;

					pivotPointRef.current?.position.copy(orbitRef.current?.target);
				}}
				onChange={(e) => {
					const val = orbitRef;
					e?.target.object.pos;
					//cameraPivot.current = orbitRef.current?.target;
					//console.log("OrbitControls onChange", orbitRef.current);
					//console.log("OrbitControls onChange", val);

					pivotPointRef.current?.position.copy(orbitRef.current?.target);

					if (e?.target.object && threeScene) {
						if (e?.target.object) {
							const cameraPosition = e?.target.object.position;
							const cameraDirection = new THREE.Vector3();
							e?.target.object.getWorldDirection(cameraDirection);
							raycaster.setFromCamera(new THREE.Vector2(0.5, 0.5), e?.target.object);
							//raycaster.set(cameraPosition, cameraDirection);

							const intersects = raycaster.intersectObjects(
								threeScene.scene.children,
								true
							);
							if (intersects.length > 0) {
								//console.log("Closest object", intersects[0].distance);
								//console.log("Closest object", intersects[0].faceIndex);
								const mesh = intersects[0].object;
								if (mesh) {
									// console.log(
									// 	"Camera is intersecting with a mesh:",
									// 	intersects[0].object
									// );
									//console.log("child", mesh.children);
								}
							}
						}
					}
				}}
				onEnd={() => {
					//cameraPivot.current = orbitRef.current?.target;
					pivotPointRef.current?.position.copy(orbitRef.current?.target);
					//orbitRef.current?.target.copy(new THREE.Vector3(0, 0, 0));
				}}
				onUpdate={(self) => {
					//console.log("OrbitControls onUpdate");
					//console.log(self);
				}}
				target={cameraPivot.current}
			/>

			<group ref={pivotPointRef} position={[0, 0, 0]}>
				<Sphere args={[0.125, 16, 16]} position={[0, 0, 0]}>
					<meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
				</Sphere>

				<InfoPanel
					scene={threeScene}
					camera={cameraRef}
					pivot={pivotPointRef}
					orbit={orbitRef}
					useGimbal={cameraControls}
				/>
			</group>

			{showStats && <Stats className=" text-lg bg-red-500" />}

			<PivotControlsComponent
				useGimbal={cameraControls}
				selectionAnchorRef={selectionAnchorRef}
			/>
			<group ref={selectionAnchorRef} matrixAutoUpdate={false} />
		</Canvas>
	);
};

export default Viewport;

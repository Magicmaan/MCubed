import { useState, useEffect } from 'react';
import * as THREE from 'three';
import * as React from 'react';
import { Canvas, useThree, invalidate } from '@react-three/fiber';
import {
	OrbitControls,
	PerspectiveCamera,
	Grid,
	Sphere,
} from '@react-three/drei';
import { Stats } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';

import { loadTexture } from '../../util/textureUtil';
import GridPlane from './GridPlane';
import {
	useAppDispatch,
	useAppSelector,
	useMeshDataSelector,
	useMeshStoreSelector,
	useViewportCameraLockSelector,
	useViewportCameraSelector,
	useViewportCameraSettingsSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from '../../hooks/useRedux';
import PivotControlsComponent from './PivotControlsComponent';
import InfoPanel from './ui/InfoPanel';
import {
	setCameraLock,
	setControls,
	setSelected,
} from '../../redux/reducers/viewportReducer';
import ModelInstance from './ModelInstance';
import { RootState } from '@react-three/fiber';
import { int } from 'three/webgpu';

const GetSceneRef: React.FC<{
	setThree: React.Dispatch<React.SetStateAction<RootState | undefined>>;
}> = ({ setThree }) => {
	const threeScene = useThree();
	setThree(threeScene);
	return <></>;
};

const Viewport: React.FC = () => {
	const viewportContainer = useState<HTMLDivElement | null>(
		document.getElementById('viewportContainer') as HTMLDivElement
	);

	const isUsingCamera = React.useRef(false);
	const threeScene = React.useRef<RootState | undefined>(undefined);

	const viewportData = useViewportSelector();
	const cameraControls = useViewportCameraSelector();
	const cameraLock = useViewportCameraLockSelector();
	const showGrid = viewportData.showGrid;
	const showStats = viewportData.showStats;
	const selected = useViewportSelectedSelector();
	const dispatch = useAppDispatch();

	const camera = useViewportCameraSettingsSelector();

	const renderMode = viewportData.renderMode;

	const selectionAnchorRef = React.useRef<THREE.Group | null>(null);
	const texture = React.useMemo(() => {
		return loadTexture('/src/assets/textures/s1.png');
	}, []);

	const cameraRef = React.useRef<THREE.PerspectiveCamera>(null);

	const orbitRef = React.useRef<
		typeof OrbitControls & { target: THREE.Vector3 }
	>(null!);
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

	const savedCameraControls = React.useRef(cameraControls);

	const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
		invalidate();
	};

	return (
		<Canvas
			id="viewport"
			frameloop="demand"
			className="z-10 h-full w-full bg-transparent"
			gl={{
				antialias: true,
				toneMapping: THREE.NoToneMapping,
			}}
			onPointerUp={() => {
				isUsingCamera.current = false;
			}}
			onMouseEnter={() => {
				dispatch(setCameraLock(true));
			}}
			onMouseLeave={() => {
				if (!isUsingCamera.current) {
					dispatch(setCameraLock(false));
				}
			}}
			onPointerMissed={() => {
				dispatch(setSelected('-1'));
				invalidate();
			}}
			onPointerMove={handlePointerMove}
		>
			<GetSceneRef setThree={(scene) => (threeScene.current = scene)} />
			{/* <GetSceneRef setThree={setThreeScene} /> */}
			<PerspectiveCamera
				makeDefault
				fov={camera.fov}
				position={camera.position}
				manual={false}
				ref={cameraRef}
			></PerspectiveCamera>
			<ambientLight />
			<pointLight position={[10, 10, 10]} />

			<ModelInstance selectionAnchorRef={selectionAnchorRef} />

			<GridPlane size={16} />
			<OrbitControls
				enableZoom={cameraControls?.zoom && cameraLock}
				enablePan={cameraControls?.pan && cameraLock}
				enableRotate={cameraControls?.rotate && cameraLock}
				enableDamping
				ref={orbitRef}
				onStart={() => {
					pivotPointRef.current?.position.copy(
						orbitRef.current?.target
					);
				}}
				onChange={(e) => {
					pivotPointRef.current?.position.copy(
						orbitRef.current?.target
					);

					// if (e?.target.object && threeScene.current) {
					// 	const cameraPosition = e?.target.object.position;
					// 	const cameraDirection = new THREE.Vector3();
					// 	e?.target.object.getWorldDirection(cameraDirection);
					// 	raycaster.setFromCamera(
					// 		new THREE.Vector2(0.5, 0.5),
					// 		e?.target.object
					// 	);

					// 	const intersects = raycaster.intersectObjects(
					// 		threeScene.current.scene.children,
					// 		true
					// 	);
					// 	if (intersects.length > 0) {
					// 		const mesh = intersects[0].object;
					// 		if (mesh) {
					// 			// Camera is intersecting with a mesh
					// 		}
					// 	}
					// }
				}}
				onEnd={() => {
					pivotPointRef.current?.position.copy(
						orbitRef.current?.target
					);
				}}
				target={cameraPivot.current}
			/>

			<group ref={pivotPointRef} position={[0, 0, 0]}>
				<Sphere args={[0.125, 16, 16]} position={[0, 0, 0]}>
					<meshBasicMaterial
						color="#ffffff"
						opacity={0.5}
						transparent
					/>
				</Sphere>

				<InfoPanel
					scene={threeScene}
					camera={cameraRef}
					pivot={pivotPointRef}
					orbit={orbitRef}
					useGimbal={cameraControls}
				/>
			</group>

			{showStats && <Stats className="bg-red-500 text-lg" />}

			<PivotControlsComponent
				useGimbal={cameraControls}
				selectionAnchorRef={selectionAnchorRef}
			/>
			<group ref={selectionAnchorRef} matrixAutoUpdate={false} />
		</Canvas>
	);
};

export default Viewport;

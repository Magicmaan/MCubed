import * as THREE from 'three';
import { Canvas, invalidate, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sphere } from '@react-three/drei';
import GridPlane, { DebugGridPlane } from './GridPlane';
import PivotControlsComponent from './PivotControlsComponent';
import ModelInstance from './ModelInstance';
import { useCubeActionBus } from '../../events/cubeActionBus';
import { RefObject, useEffect, useRef, useState } from 'react';

const rendererPixelRatio = 0.5;
function RendererResolution() {
	const { gl, size } = useThree();

	useEffect(() => {
		gl.setPixelRatio(rendererPixelRatio);
		gl.setSize(size.width, size.height, false);
		gl.domElement.classList.add('pixel-perfect-renderer');
		gl.domElement.style.imageRendering = 'pixelated';
		invalidate();
	}, [gl, size.height, size.width]);

	return null;
}

function CameraPivot({
	pivotPointRef,
}: {
	pivotPointRef: RefObject<THREE.Group | null>;
}) {
	return (
		<group ref={pivotPointRef} position={[0, 0, 0]}>
			<Sphere args={[0.125, 16, 16]} position={[0, 0, 0]}>
				<meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
			</Sphere>
		</group>
	);
}

function Viewport() {
	const selectionAnchorRef = useRef<THREE.Group | null>(null);
	const usingGimbal = useRef(false);
	const pivotPointRef = useRef<THREE.Group | null>(null);
	const orbitRef = useRef<any>(null);
	const [orbitEnabled, setOrbitEnabled] = useState(true);
	const [selectedCubeId, setSelectedCubeId] = useState<string | null>(null);
	const { dispatch, subscribe } = useCubeActionBus();

	useEffect(() => {
		const unsubscribeFromSelected = subscribe(
			'cubeSelected',
			({ snapshot }) => {
				setSelectedCubeId(snapshot.id);
			}
		);
		const unsubscribeFromUnselected = subscribe(
			'cubeUnselected',
			({ cubeId }) => {
				setSelectedCubeId((currentCubeId) => {
					if (currentCubeId !== cubeId) return currentCubeId;

					return null;
				});
			}
		);

		return () => {
			unsubscribeFromSelected();
			unsubscribeFromUnselected();
		};
	}, [subscribe]);

	return (
		<Canvas
			id="viewport"
			dpr={rendererPixelRatio}
			frameloop="demand"
			className="pixel-perfect-renderer z-10 h-full w-full bg-transparent"
			gl={{
				antialias: false,
				powerPreference: 'high-performance',
				toneMapping: THREE.NoToneMapping,
			}}
			onPointerMissed={() => {
				if (selectedCubeId) {
					dispatch('cubeAction', {
						action: { type: 'unselect' },
						cubeId: selectedCubeId,
					});
				}
				invalidate();
			}}
			onPointerMove={() => invalidate()}
		>
			<RendererResolution />
			<PerspectiveCamera
				makeDefault
				fov={75}
				position={[10, 10, 10]}
				manual={false}
			/>
			<ambientLight />
			<pointLight position={[10, 10, 10]} />

			<ModelInstance />

			<GridPlane size={16} />
			<DebugGridPlane />

			<OrbitControls
				enableZoom={orbitEnabled}
				enablePan={orbitEnabled}
				enableRotate={orbitEnabled}
				enableDamping
				ref={orbitRef}
				onStart={() => {
					pivotPointRef.current?.position.copy(
						orbitRef.current?.target ?? new THREE.Vector3()
					);
				}}
				onChange={() => {
					pivotPointRef.current?.position.copy(
						orbitRef.current?.target ?? new THREE.Vector3()
					);
					invalidate();
				}}
				onEnd={() => {
					pivotPointRef.current?.position.copy(
						orbitRef.current?.target ?? new THREE.Vector3()
					);
					invalidate();
				}}
				target={[0, 0, 0]}
			/>

			<CameraPivot pivotPointRef={pivotPointRef} />

			<PivotControlsComponent
				usingGimbal={usingGimbal}
				selectionAnchorRef={selectionAnchorRef}
				setOrbitEnabled={setOrbitEnabled}
			/>
			<group ref={selectionAnchorRef} matrixAutoUpdate={false} />
		</Canvas>
	);
}

export default Viewport;

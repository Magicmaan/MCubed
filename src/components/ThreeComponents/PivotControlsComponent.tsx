import * as THREE from 'three';
import { Box } from '@react-three/drei';
import { invalidate, useFrame } from '@react-three/fiber';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type RefObject,
} from 'react';
import { PivotControls } from './custom_PivotControl';
import { OnDragStartProps } from './custom_PivotControl/context';
import { useCubeActionBus } from '../../events/cubeActionBus';

function PivotControlsComponent({
	selectionAnchorRef,
	usingGimbal,
	setOrbitEnabled,
}: {
	selectionAnchorRef: RefObject<THREE.Group<THREE.Object3DEventMap> | null>;
	usingGimbal: RefObject<boolean>;
	setOrbitEnabled: (enabled: boolean) => void;
}) {
	const pivotRef = useRef<THREE.Group<THREE.Object3DEventMap>>(null);
	const [visible, setVisible] = useState(false);
	const dragComponent = useRef<OnDragStartProps['component'] | null>(null);
	const resizeStartSize = useRef(new THREE.Vector3(1, 1, 1));
	const { dispatchCubeAction, selectedCube, selectedCubeVersion } =
		useCubeActionBus();

	const syncPivotToCube = useCallback(() => {
		if (!selectedCube || !pivotRef.current) {
			setVisible(false);
			return;
		}

		selectedCube.updateMatrixWorld(true);
		pivotRef.current.matrix.copy(selectedCube.matrixWorld);
		pivotRef.current.updateMatrixWorld(true);
		selectionAnchorRef.current?.matrix.copy(selectedCube.matrixWorld);
		selectionAnchorRef.current?.updateMatrixWorld(true);
		setVisible(true);
	}, [selectedCube, selectedCubeVersion, selectionAnchorRef]);

	useEffect(() => {
		syncPivotToCube();
		invalidate();
	}, [syncPivotToCube]);

	useFrame(() => {
		if (!usingGimbal.current) {
			syncPivotToCube();
		}
	});

	const onDragStart = useCallback(
		(props: OnDragStartProps) => {
			if (!selectedCube) return;

			dragComponent.current = props.component;
			resizeStartSize.current.copy(selectedCube.size);
			usingGimbal.current = true;
			setOrbitEnabled(false);
			syncPivotToCube();
			invalidate();
		},
		[selectedCube, setOrbitEnabled, syncPivotToCube, usingGimbal]
	);

	const onDrag = useCallback(
		(matrix: THREE.Matrix4) => {
			if (!selectedCube || !pivotRef.current) return;

			const position = new THREE.Vector3();
			const quaternion = new THREE.Quaternion();
			const scale = new THREE.Vector3();
			matrix.decompose(position, quaternion, scale);

			switch (dragComponent.current) {
				case 'Arrow':
				case 'Slider':
					dispatchCubeAction(selectedCube.cubeId, {
						type: 'move',
						position,
					});
					break;
				case 'Rotator':
					dispatchCubeAction(selectedCube.cubeId, {
						type: 'rotate',
						rotation: new THREE.Euler().setFromQuaternion(
							quaternion
						),
					});
					break;
				case 'Sphere':
					dispatchCubeAction(selectedCube.cubeId, {
						type: 'resize',
						size: resizeStartSize.current.clone().multiply(scale),
					});
					break;
				default:
					dispatchCubeAction(selectedCube.cubeId, {
						type: 'matrix',
						matrix,
					});
					break;
			}

			pivotRef.current.matrix.copy(selectedCube.matrixWorld);
			pivotRef.current.updateMatrixWorld(true);
			selectionAnchorRef.current?.matrix.copy(selectedCube.matrixWorld);
			selectionAnchorRef.current?.updateMatrixWorld(true);
			invalidate();
		},
		[dispatchCubeAction, selectedCube, selectionAnchorRef]
	);

	const onDragEnd = useCallback(() => {
		dragComponent.current = null;
		usingGimbal.current = false;
		setOrbitEnabled(true);
		syncPivotToCube();
		invalidate();
	}, [setOrbitEnabled, syncPivotToCube, usingGimbal]);

	return (
		<group matrixAutoUpdate={false} visible={visible}>
			<PivotControls
				ref={pivotRef}
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				matrix={pivotRef.current?.matrix}
				autoTransform={false}
				anchor={[0, 0, 0]}
				scale={1.0}
				rotation={[0, 0, 0]}
				depthTest={false}
				visible={visible}
				enabled={visible}
				usingGimbal={usingGimbal}
			>
				<Box matrixAutoUpdate={false} args={[0, 0, 0]} />
			</PivotControls>
		</group>
	);
}

export default PivotControlsComponent;

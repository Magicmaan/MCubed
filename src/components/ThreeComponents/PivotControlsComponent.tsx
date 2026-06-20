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
import type { Cube } from '../../types/mesh';

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
	const [selectedCube, setSelectedCube] = useState<Cube | null>(null);
	const [selectedCubeVersion, setSelectedCubeVersion] = useState(0);
	const dragComponent = useRef<OnDragStartProps['component'] | null>(null);
	const resizeStartSize = useRef(new THREE.Vector3(1, 1, 1));
	const mountedCubes = useRef(new Map<string, Cube>());
	const { dispatch, subscribe } = useCubeActionBus();

	useEffect(() => {
		const unsubscribeFromMounted = subscribe('cubeMounted', ({ cube }) => {
			mountedCubes.current.set(cube.cubeId, cube);
		});
		const unsubscribeFromUnmounted = subscribe(
			'cubeUnmounted',
			({ cubeId }) => {
				mountedCubes.current.delete(cubeId);
				setSelectedCube((currentCube) => {
					if (currentCube?.cubeId !== cubeId) return currentCube;

					return null;
				});
				setSelectedCubeVersion((version) => version + 1);
			}
		);
		const unsubscribeFromSelected = subscribe(
			'cubeSelected',
			({ cube }) => {
				mountedCubes.current.set(cube.cubeId, cube);
				setSelectedCube(cube);
				setSelectedCubeVersion((version) => version + 1);
			}
		);
		const unsubscribeFromUnselected = subscribe(
			'cubeUnselected',
			({ cubeId }) => {
				setSelectedCube((currentCube) => {
					if (currentCube?.cubeId !== cubeId) return currentCube;

					return null;
				});
				setSelectedCubeVersion((version) => version + 1);
			}
		);
		const unsubscribeFromChanged = subscribe(
			'cubeChanged',
			({ snapshot }) => {
				setSelectedCube((currentCube) => {
					if (currentCube?.cubeId !== snapshot.id) return currentCube;

					setSelectedCubeVersion((version) => version + 1);
					return currentCube;
				});
			}
		);

		return () => {
			unsubscribeFromMounted();
			unsubscribeFromUnmounted();
			unsubscribeFromSelected();
			unsubscribeFromUnselected();
			unsubscribeFromChanged();
		};
	}, [subscribe]);

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
					dispatch('cubeAction', {
						action: {
							type: 'move',
							position,
						},
						cubeId: selectedCube.cubeId,
					});
					break;
				case 'Rotator':
					dispatch('cubeAction', {
						action: {
							type: 'rotate',
							rotation: new THREE.Euler().setFromQuaternion(
								quaternion
							),
						},
						cubeId: selectedCube.cubeId,
					});
					break;
				case 'Sphere':
					dispatch('cubeAction', {
						action: {
							type: 'resize',
							size: resizeStartSize.current
								.clone()
								.multiply(scale),
						},
						cubeId: selectedCube.cubeId,
					});
					break;
				default:
					break;
			}

			pivotRef.current.matrix.copy(selectedCube.matrixWorld);
			pivotRef.current.updateMatrixWorld(true);
			selectionAnchorRef.current?.matrix.copy(selectedCube.matrixWorld);
			selectionAnchorRef.current?.updateMatrixWorld(true);
			invalidate();
		},
		[dispatch, selectedCube, selectionAnchorRef]
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

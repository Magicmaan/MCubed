import * as React from 'react';
import * as THREE from 'three';
import { Box } from '@react-three/drei';
import { PivotControls } from './custom_PivotControl';
import {
	useAppDispatch,
	useMeshDataSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from '../../hooks/useRedux';
import { meshModifyID } from '../../redux/reducers/meshReducer';
import { setControls } from '../../redux/reducers/viewportReducer';
import { invalidate, useFrame } from '@react-three/fiber';

import { useKeyPressEvent, useUpdate } from 'react-use';
import { OnDragStartProps } from './custom_PivotControl/context';
import { Scale } from 'lucide-react';
import { modifiers, moveModifierIncrement } from '../../constants/KeyModifiers';
import { round } from '../../util';

// PLEASE DO NOT TOUCH
// I HAVE NO IDEA HOW THIS WORKS BUT IT DOES

// to use, pass the cube / group you want to control as the selected prop
// useGimbal is a boolean that can be toggled to tell if the gimbal is being used

const PivotControlsComponent: React.FC<{
	selectionAnchorRef: React.MutableRefObject<THREE.Group<THREE.Object3DEventMap> | null>;
	usingGimbal: React.MutableRefObject<boolean>;
}> = ({ selectionAnchorRef, usingGimbal }) => {
	const moveMultiplier = React.useRef(1);
	useKeyPressEvent(
		modifiers.small_shift,
		() => (moveMultiplier.current = 1),
		() => (moveMultiplier.current = 2)
	);
	useKeyPressEvent(
		modifiers.x_small_shift,
		() => (moveMultiplier.current = 0.5),
		() => (moveMultiplier.current = 2)
	);

	const preMatrix = new THREE.Matrix4();
	const preMatrixInv = new THREE.Matrix4();
	const viewportStore = useViewportSelector();
	const dispatch = useAppDispatch();
	const isDispatching = React.useRef(false);
	const forceUpdate = useUpdate();
	const previousDragMatrix = new THREE.Matrix4();
	const selectedID = useViewportSelectedSelector();

	const meshData = useMeshDataSelector();
	const selectedCube = React.useRef(
		meshData.find((item) => item.id === selectedID)
	);

	React.useEffect(() => {
		if (selectedID === '-1') {
			visible.current = false;
			selectedCube.current = undefined;
		} else {
			// on selected change, move gizmo to cubes position
			const selectIndex = meshData.findIndex(
				(item) => item.id === selectedID
			);
			selectedCube.current = meshData[selectIndex];
			if (selectedCube.current) {
				pivotRef.current?.matrix.setPosition(
					new THREE.Vector3(
						selectedCube.current?.position[0] || 0,
						selectedCube.current?.position[1] || 0,
						selectedCube.current?.position[2] || 0
					)
				);
				pivotRef.current?.matrix.makeRotationFromEuler(
					new THREE.Euler(
						selectedCube.current?.rotation[0] || 0,
						selectedCube.current?.rotation[1] || 0,
						selectedCube.current?.rotation[2] || 0
					)
				);
				//also move the selection anchor to the pivot
				selectionAnchorRef.current?.matrix.copy(
					pivotRef.current?.matrix
				);
			}
			visible.current = true;
		}
		pivotRef.current?.updateMatrixWorld(true);
		invalidate();
		forceUpdate();
	}, [selectedID, forceUpdate, meshData, selectionAnchorRef]);

	const visible = React.useRef(false);
	//console.log(three);
	const pivotRef = React.useRef<THREE.Group<THREE.Object3DEventMap>>(null);

	const dragType = React.useRef<'Arrow' | 'Slider' | 'Rotator' | 'Sphere'>(
		'Arrow'
	);
	const dragAxis = React.useRef<'x' | 'y' | 'z'>('x');

	const handleDispatch = async (
		position: THREE.Vector3,
		quaternion: THREE.Quaternion,
		scale: THREE.Vector3
	) => {
		//used to throttle dispatches, as the drag event is called wayyy too much
		if (isDispatching.current) return;
		if (selectedID === '-1' || selectedID === undefined) {
			return;
		}
		isDispatching.current = true;

		//add 10ms to give function time 10ms + some change to finish
		// means dispatches are throttled to 100 per second at best (10ms)
		await new Promise((resolve) => setTimeout(resolve, 8));
		dispatch(
			meshModifyID({
				id: selectedID,
				position: position.toArray(),
				rotation: new THREE.Euler()
					.setFromQuaternion(quaternion)
					.toArray() as [number, number, number],
				size: [scale.x, scale.y, scale.z],
				updateUV: false,
			})
		);
		isDispatching.current = false;
	};

	const onDragStart = React.useCallback(
		(props: OnDragStartProps) => {
			console.log('drag origin', props.origin);
			dragType.current = props.component as
				| 'Arrow'
				| 'Slider'
				| 'Rotator'
				| 'Sphere';
			dragAxis.current =
				props.axis === 0 ? 'x' : props.axis === 1 ? 'y' : 'z';
			dispatch(setControls({ zoom: false, pan: false, rotate: false }));
			usingGimbal.current = true;
			preMatrix.copy(
				selectionAnchorRef.current?.matrix || new THREE.Matrix4()
			);
			preMatrix.scale(
				new THREE.Vector3(
					selectedCube.current?.size[0] || 0,
					selectedCube.current?.size[1] || 0,
					selectedCube.current?.size[2] || 0
				)
			);
			// selectionAnchorRef.current?.matrixWorld.setPosition(
			// 	selectedCube.current?.position[0] || 0,
			// 	selectedCube.current?.position[1] || 0,
			// 	selectedCube.current?.position[2] || 0
			// );
			// selectionAnchorRef.current?.matrixWorld.makeRotationFromEuler(
			// 	new THREE.Euler(
			// 		selectedCube.current?.rotation[0] || 0,
			// 		selectedCube.current?.rotation[1] || 0,
			// 		selectedCube.current?.rotation[2] || 0
			// 	)
			// );

			selectionAnchorRef.current?.updateMatrixWorld(true);
			preMatrixInv.copy(preMatrix).invert();
			invalidate();
		},
		[selectedID]
	);
	const onDrag = React.useCallback(
		(matrix: THREE.Matrix4) => {
			if (!selectionAnchorRef.current) return;
			if (!selectedCube.current) return;

			const pos = new THREE.Vector3().setFromMatrixPosition(matrix);
			const scale = new THREE.Vector3().setFromMatrixScale(matrix);
			scale.multiply(new THREE.Vector3().setFromMatrixScale(preMatrix));

			//since uses percentages and maths hard, have to manually round size here
			// slightly different behaviour for usability
			// normal = 2
			// shift = 1
			// ctrl = 0.5
			console.log('drag axis', dragAxis.current);
			if (dragType.current === 'Sphere') {
				if (dragAxis.current === 'x') {
					scale.setX(round(scale.x, moveMultiplier.current, 0));
				} else if (dragAxis.current === 'y') {
					scale.setY(round(scale.y, moveMultiplier.current, 0));
				} else if (dragAxis.current === 'z') {
					scale.setZ(round(scale.z, moveMultiplier.current, 0));
				}
			}
			const invertScale = new THREE.Vector3().setFromMatrixScale(
				new THREE.Matrix4().copy(matrix).invert()
			);

			// the magic sauce..
			const matrixToApply = matrix.clone();

			// preMatrixInv
			// 	.clone()
			// 	.multiply(matrix)
			// 	.multiply(preMatrix);
			//idek how this works, but it does
			if (dragType.current === 'Rotator') {
				matrixToApply.setPosition(
					new THREE.Vector3(
						selectedCube.current?.position[0],
						selectedCube.current?.position[1],
						selectedCube.current?.position[2]
					)
				);
			}

			selectionAnchorRef.current.matrix.copy(matrixToApply);
			pivotRef.current?.matrix.copy(matrixToApply);
			//pivotRef.current?.matrixWorld.copy(matrixToApply);

			// if (dragType.current === 'Rotator') {
			// 	selectionAnchorRef.current.matrix.setPosition(oldPos);
			// 	selectionAnchorRef.current.matrixWorld.setPosition(oldPos);

			// 	pivotRef.current?.matrix.setPosition(oldPos);
			// 	pivotRef.current?.matrixWorld.setPosition(oldPos);
			// }

			pivotRef.current?.updateMatrixWorld(true);
			selectionAnchorRef.current.updateMatrixWorld(true);

			// pass position to redux store
			const position = new THREE.Vector3();
			const quaternion = new THREE.Quaternion();

			selectionAnchorRef.current.matrixWorld.decompose(
				position,
				quaternion,
				new THREE.Vector3()
			);

			selectionAnchorRef.current.matrix.scale(invertScale);
			pivotRef.current?.matrix.scale(invertScale);
			pivotRef.current?.updateMatrixWorld(true);
			selectionAnchorRef.current.updateMatrixWorld(true);

			console.log('new size', scale.x, scale.y, scale.z);
			previousDragMatrix.copy(matrixToApply);
			handleDispatch(position, quaternion, scale);
			invalidate();
		},
		[selectedID]
	);
	const onDragEnd = React.useCallback(() => {
		if (!selectionAnchorRef.current) return;
		if (viewportStore.selected === undefined) return;
		if (viewportStore.selected === '-1') return;

		if (selectionAnchorRef.current instanceof THREE.Object3D) {
			selectionAnchorRef.current.updateMatrixWorld(true);
		}
		usingGimbal.current = false;
		const prePosition = new THREE.Vector3();
		preMatrix.decompose(
			prePosition,
			new THREE.Quaternion(),
			new THREE.Vector3()
		);
		//pivotMatrix.copy(pivotRef.current.matrixWorld);
		//console.log(`Distance moved: ${distanceMoved}`);

		//re enable camera controls
		dispatch(setControls({ zoom: true, pan: true, rotate: true }));
		usingGimbal.current = false;
	}, [selectedID]);

	useFrame(() => {
		if (pivotRef.current) {
			selectedCube.current = meshData.find(
				(item) => item.id === selectedID
			);

			pivotRef.current?.matrix.setPosition(
				new THREE.Vector3(
					selectedCube.current?.position[0] || 0,
					selectedCube.current?.position[1] || 0,
					selectedCube.current?.position[2] || 0
				)
			);

			pivotRef.current.updateMatrixWorld(true);
		}
	});

	return (
		<group
			//ref={pivotRef}
			visible={visible.current}
			onUpdate={() => {
				if (selectedID === '-1') {
					visible.current = false;
				} else {
					visible.current = true;
				}
			}}
			matrixAutoUpdate={false}
			userData={{ id: 'pivot', selectedID: selectedID }}
		>
			<PivotControls
				ref={pivotRef}
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				matrix={pivotRef.current?.matrix}
				autoTransform={false}
				anchor={[0, 0, 0]}
				scale={1.5}
				rotation={[0, 0, 0]}
				depthTest={false}
				visible={visible.current}
				enabled={visible.current}
				usingGimbal={usingGimbal}
			>
				{/* Box is placeholder, needed to attach pivot controls */}
				<Box matrixAutoUpdate={false} args={[0, 0, 0]} />
			</PivotControls>
		</group>
	);
};

export default PivotControlsComponent;

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
import { meshModify, meshModifyIndex } from '../../reducers/meshReducer';
import { setControls } from '../../reducers/viewportReducer';
import { invalidate, useFrame, useThree } from '@react-three/fiber';
import { ForwardRefComponent } from '@react-three/drei/helpers/ts-utils';
import { useStateList, useTimeoutFn, useUpdate } from 'react-use';

// PLEASE DO NOT TOUCH
// I HAVE NO IDEA HOW THIS WORKS BUT IT DOES

// to use, pass the cube / group you want to control as the selected prop
// useGimbal is a boolean that can be toggled to tell if the gimbal is being used

const PivotControlsComponent: React.FC<{
	selectionAnchorRef: React.MutableRefObject<THREE.Group<THREE.Object3DEventMap> | null>;
}> = ({ selectionAnchorRef }) => {
	var preMatrix = new THREE.Matrix4();
	var preMatrixInv = new THREE.Matrix4();
	const viewportStore = useViewportSelector();
	const dispatch = useAppDispatch();
	const isDispatching = React.useRef(false);
	const forceUpdate = useUpdate();

	const selectedID = useViewportSelectedSelector();

	const meshData = useMeshDataSelector();
	const selectedRef = React.useRef(
		meshData.find((item) => item.id === selectedID)
	);

	React.useEffect(() => {
		console.log('selected changed pivot', selectedID);
		if (selectedID === -1) {
			visible.current = false;
			selectedRef.current = undefined;
		} else {
			// on selected change, move gizmo to cubes position
			const selectIndex = meshData.findIndex(
				(item) => item.id === selectedID
			);
			selectedRef.current = meshData[selectIndex];
			if (selectedRef.current) {
				pivotRef.current?.matrix.setPosition(
					new THREE.Vector3(
						selectedRef.current?.position[0] || 0,
						selectedRef.current?.position[1] || 0,
						selectedRef.current?.position[2] || 0
					)
				);
				pivotRef.current?.matrix.makeRotationFromEuler(
					new THREE.Euler(
						selectedRef.current?.rotation[0] || 0,
						selectedRef.current?.rotation[1] || 0,
						selectedRef.current?.rotation[2] || 0
					)
				);
				//also move the selection anchor to the pivot
				selectionAnchorRef.current?.matrix.copy(
					pivotRef.current.matrix
				);
				console.log(
					'Current selected position',
					pivotRef.current?.position
				);
				console.log(
					'Selected ref position',
					selectedRef.current?.position
				);
			}
			visible.current = true;
		}
		pivotRef.current?.updateMatrixWorld(true);
		invalidate();
		forceUpdate();
	}, [selectedID]);

	const visible = React.useRef(false);
	//console.log(three);
	const pivotRef = React.useRef<THREE.Group<THREE.Object3DEventMap>>(null);
	const pivotMatrix = pivotRef.current?.matrixWorld;
	const pivotMatrixRef = React.useRef<THREE.Matrix4>(new THREE.Matrix4());

	const handleDispatch = async (
		position: THREE.Vector3,
		quaternion: THREE.Quaternion,
		dispatch: any
	) => {
		//used to throttle dispatches, as the drag event is called wayyy too much
		if (isDispatching.current) return;
		if (selectedID === -1 || selectedID === undefined) {
			return;
		}
		isDispatching.current = true;

		var cubeIndex = meshData.findIndex((item) => item.id === selectedID);
		const cube = meshData.find((item, index) =>
			item.id === selectedID ? index : -1
		);
		//add 10ms to give function time 10ms + some change to finish
		// means dispatches are throttled to 100 per second at best (10ms)
		await new Promise((resolve) => setTimeout(resolve, 8));
		dispatch(
			meshModify({
				id: selectedID,
				position: position.toArray(),
				rotation: new THREE.Euler()
					.setFromQuaternion(quaternion)
					.toArray() as [number, number, number],
			})
		);
		isDispatching.current = false;
	};

	const onDragStart = React.useCallback(() => {
		dispatch(setControls({ zoom: false, pan: false, rotate: false }));
		preMatrix.copy(selectionAnchorRef.current?.matrix);
		preMatrixInv.copy(preMatrix).invert();
		invalidate();
	}, [selectedID]);
	const onDrag = React.useCallback(
		(matrix: THREE.Matrix4) => {
			if (!selectionAnchorRef.current) return;

			// the magic sauce..
			const matrixToApply = preMatrixInv
				.clone()
				.multiply(matrix)
				.multiply(preMatrix);

			selectionAnchorRef.current.matrix.copy(matrixToApply);
			selectionAnchorRef.current.matrixWorld.copy(matrixToApply);
			pivotRef.current?.matrix.copy(matrixToApply);
			pivotRef.current?.matrixWorld.copy(matrixToApply);

			pivotRef.current?.updateMatrixWorld(true);
			selectionAnchorRef.current.updateMatrixWorld(true);

			// pass position to redux store
			const position = new THREE.Vector3();
			const quaternion = new THREE.Quaternion();
			const scale = new THREE.Vector3();
			matrixToApply.decompose(position, quaternion, scale);
			handleDispatch(position, quaternion, dispatch);
			invalidate();
		},
		[selectedID]
	);
	const onDragEnd = React.useCallback(() => {
		if (!selectionAnchorRef.current) return;
		if (viewportStore.selected === undefined) return;
		if (viewportStore.selected === -1) return;

		if (selectionAnchorRef.current instanceof THREE.Object3D) {
			selectionAnchorRef.current.updateMatrixWorld(true);
		}
		const prePosition = new THREE.Vector3();
		preMatrix.decompose(
			prePosition,
			new THREE.Quaternion(),
			new THREE.Vector3()
		);
		const distanceMoved = prePosition.distanceTo(
			selectionAnchorRef.current.position
		);
		//pivotMatrix.copy(pivotRef.current.matrixWorld);
		//console.log(`Distance moved: ${distanceMoved}`);

		//re enable camera controls
		dispatch(setControls({ zoom: true, pan: true, rotate: true }));
	}, [selectedID]);

	useFrame(() => {
		if (pivotRef.current) {
			selectedRef.current = meshData.find(
				(item) => item.id === selectedID
			);

			pivotRef.current?.matrix.setPosition(
				new THREE.Vector3(
					selectedRef.current?.position[0] || 0,
					selectedRef.current?.position[1] || 0,
					selectedRef.current?.position[2] || 0
				)
			);

			pivotRef.current.updateMatrixWorld(true);
		}
	});

	return (
		<group
			//ref={pivotRef}
			visible={visible.current}
			onUpdate={(self) => {
				if (selectedID === -1) {
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
			>
				{/* Box is placeholder, needed to attach pivot controls */}
				<Box matrixAutoUpdate={false} args={[0, 0, 0]} />
			</PivotControls>
		</group>
	);
};

export default PivotControlsComponent;

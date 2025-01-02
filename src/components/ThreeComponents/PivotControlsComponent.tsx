import * as React from "react";
import * as THREE from "three";
import { Box } from "@react-three/drei";
import { PivotControls } from "./custom_PivotControl";
import {
	useAppDispatch,
	useViewportSelectedSelector,
	useViewportSelector,
} from "../../hooks/useRedux";
import { meshModifyIndex } from "../../reducers/meshReducer";
import { setControls } from "../../reducers/viewportReducer";
import { invalidate, useFrame, useThree } from "@react-three/fiber";
import { ForwardRefComponent } from "@react-three/drei/helpers/ts-utils";
import { useStateList } from "react-use";

// PLEASE DO NOT TOUCH
// I HAVE NO IDEA HOW THIS WORKS BUT IT DOES

// to use, pass the cube / group you want to control as the selected prop
// useGimbal is a boolean that can be toggled to tell if the gimbal is being used

const PivotControlsComponent: React.FC<{
	useGimbal?: { zoom: boolean; pan: boolean; rotate: boolean };
	selectionAnchorRef: React.RefObject<THREE.Mesh>;
}> = ({ useGimbal: inlol, selectionAnchorRef }) => {
	const pivotMatrix = new THREE.Matrix4();
	var preMatrix = new THREE.Matrix4();
	var preMatrixInv = new THREE.Matrix4();
	const viewportStore = useViewportSelector();
	const dispatch = useAppDispatch();
	const three = useThree();

	const selectedID = React.useState(useViewportSelectedSelector());
	React.useEffect(() => {
		console.log("selected changed pivot", selectedID);
		if (selectedID[0] === -1 || selectedID[0] === undefined) {
			visible.current = false;
		} else {
			visible.current = true;
		}
		invalidate();
	}, [selectedID]);

	const visible = React.useRef(false);
	//console.log(three);
	const pivotRef = React.useRef(null);
	useFrame(() => {
		if (pivotRef.current) {
			if (selectedID[0] === -1 || selectedID[0] === undefined) {
				visible.current = false;
			} else {
				visible.current = true;
			}
		}
	});
	return (
		<group
			ref={pivotRef}
			visible={visible.current}
			userData={{ id: "pivot", selectedID: selectedID[0] }}>
			<PivotControls
				onDragStart={() => {
					dispatch(setControls({ zoom: false, pan: false, rotate: false }));
					if (!selectionAnchorRef.current) return;
					if (viewportStore.selected === undefined) return;
					if (viewportStore.selected === -1) return;

					preMatrix.copy(selectionAnchorRef.current?.matrix);
					preMatrixInv.copy(preMatrix).invert();

					invalidate();
				}}
				onDrag={(ml, mdl, mw, mdw) => {
					if (!selectionAnchorRef.current) return;
					if (viewportStore.selected === undefined) return;
					if (viewportStore.selected === -1) return;

					//console.log("Drag");
					const matrixToApply = selectionAnchorRef?.current.matrix
						.copy(preMatrixInv)
						.multiply(ml)
						.multiply(preMatrix);
					selectionAnchorRef?.current.matrix.copy(
						matrixToApply ? matrixToApply : selectionAnchorRef.current.matrix
					);

					// selectionAnchorRef?.current.position.copy(pos);
					// selectionAnchorRef?.current.quaternion.copy(quat);
					// selectionAnchorRef?.current.scale.copy(scale);

					selectionAnchorRef?.current?.updateMatrixWorld(true);
					const position = new THREE.Vector3();
					const quaternion = new THREE.Quaternion();
					const scale = new THREE.Vector3();
					matrixToApply?.decompose(position, quaternion, scale);

					dispatch(
						meshModifyIndex({
							index: viewportStore.selected ?? 0,
							position: position.toArray(),
							rotation: new THREE.Euler().setFromQuaternion(quaternion).toArray() as [
								number,
								number,
								number
							],
						})
					);
					invalidate();
				}}
				onDragEnd={() => {
					if (!selectionAnchorRef.current) return;
					if (viewportStore.selected === undefined) return;
					if (viewportStore.selected === -1) return;

					if (selectionAnchorRef.current instanceof THREE.Object3D) {
						selectionAnchorRef.current.updateMatrixWorld(true);
					}
					const prePosition = new THREE.Vector3();
					preMatrix.decompose(prePosition, new THREE.Quaternion(), new THREE.Vector3());
					const distanceMoved = prePosition.distanceTo(
						selectionAnchorRef.current.position
					);
					//console.log(`Distance moved: ${distanceMoved}`);

					//re enable camera controls
					dispatch(setControls({ zoom: true, pan: true, rotate: true }));
				}}
				autoTransform={true}
				anchor={[0, 0, 0]}
				scale={2}
				rotation={[0, 0, 0]}
				depthTest={false}
				visible={visible.current}
				enabled={visible.current}>
				{/* Box is placeholder, needed to attach pivot controls */}
				<Box matrix={pivotMatrix} matrixAutoUpdate={false} args={[0, 0, 0]} />
			</PivotControls>
		</group>
	);
};

export default PivotControlsComponent;

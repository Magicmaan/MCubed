import * as React from "react";
import * as THREE from "three";
import { Box } from "@react-three/drei";
import { PivotControls } from "../custom_PivotControl";
import {
	useAppDispatch,
	useMeshSelector,
	useViewportSelector,
} from "../../hooks/useRedux";
import { meshModifyIndex, testReducer } from "../../reducers/meshReducer";
import { disableGimbal, enableGimbal } from "../../reducers/viewportReducer";
import { invalidate, useFrame, useThree } from "@react-three/fiber";
import { ForwardRefComponent } from "@react-three/drei/helpers/ts-utils";

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
	const useGimbal = viewportStore.useGimbal;
	const dispatch = useAppDispatch();
	const meshStore = useMeshSelector();
	const meshProps = meshStore.mesh;
	const three = useThree();
	console.log(three);

	const pivotRef = React.useRef(null);

	React.useEffect(() => {
		console.log("pivot", pivotRef.current);
	}, [pivotRef.current]);
	useFrame(() => {
		console.log("Pivot control frame");
		console.log(pivotRef.current);
	});

	return (
		<>
			<PivotControls
				ref={pivotRef}
				onDragStart={() => {
					dispatch(disableGimbal([false, false, false]));
					if (!selectionAnchorRef.current) return;

					preMatrix.copy(selectionAnchorRef.current?.matrix);
					preMatrixInv.copy(preMatrix).invert();
					invalidate();
				}}
				onDrag={(ml, mdl, mw, mdw) => {
					if (!selectionAnchorRef.current) return;

					const matrixToApply = selectionAnchorRef?.current.matrix
						.copy(preMatrixInv)
						.multiply(ml)
						.multiply(preMatrix);
					selectionAnchorRef?.current.matrix.copy(
						matrixToApply ? matrixToApply : selectionAnchorRef.current.matrix
					);
					const position = new THREE.Vector3();
					const quaternion = new THREE.Quaternion();
					const scale = new THREE.Vector3();
					matrixToApply?.decompose(position, quaternion, scale);

					// selectionAnchorRef?.current.position.copy(pos);
					// selectionAnchorRef?.current.quaternion.copy(quat);
					// selectionAnchorRef?.current.scale.copy(scale);

					selectionAnchorRef?.current?.updateMatrixWorld(true);

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
					dispatch(enableGimbal());
					if (!selectionAnchorRef.current) return;
					if (selectionAnchorRef.current instanceof THREE.Object3D) {
						selectionAnchorRef.current.updateMatrixWorld(true);
					}
					const prePosition = new THREE.Vector3();
					preMatrix.decompose(prePosition, new THREE.Quaternion(), new THREE.Vector3());
					const distanceMoved = prePosition.distanceTo(
						selectionAnchorRef.current.position
					);
					console.log(`Distance moved: ${distanceMoved}`);

					dispatch(testReducer());
				}}
				autoTransform={true}
				anchor={[0, 0, 0]}
				scale={2}
				rotation={[0, 0, 0]}
				depthTest={false}
				enabled={true}
				visible={viewportStore.selected !== undefined}>
				{/* Box is placeholder, needed to attach pivot controls */}
				<Box matrix={pivotMatrix} matrixAutoUpdate={false} args={[0, 0, 0]} />
			</PivotControls>
		</>
	);
};

export default PivotControlsComponent;

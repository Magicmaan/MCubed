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
import { invalidate, useThree } from "@react-three/fiber";

// PLEASE DO NOT TOUCH
// I HAVE NO IDEA HOW THIS WORKS BUT IT DOES

// to use, pass the cube / group you want to control as the selected prop
// useGimbal is a boolean that can be toggled to tell if the gimbal is being used

const PivotControlsComponent: React.FC<{
	useGimbal?: { zoom: boolean; pan: boolean; rotate: boolean };
	selected?: React.RefObject<THREE.Mesh>;
}> = ({ useGimbal: inlol, selected }) => {
	const pivotMatrix = new THREE.Matrix4();
	var preMatrix = new THREE.Matrix4();
	var preMatrixInv = new THREE.Matrix4();

	const useGimbal = useViewportSelector().useGimbal;
	const dispatch = useAppDispatch();
	const meshStore = useMeshSelector();
	const meshProps = meshStore.mesh;

	const three = useThree();
	console.log(three);

	return (
		<>
			<PivotControls
				onDragStart={() => {
					dispatch(disableGimbal());
					if (!selected.current) return;

					preMatrix.copy(selected.current?.matrix);
					preMatrixInv.copy(preMatrix).invert();
					invalidate();
				}}
				onDrag={(ml, mdl, mw, mdw) => {
					if (!selected.current) return;

					const matrixToApply = selected?.current.matrix
						.copy(preMatrixInv)
						.multiply(ml)
						.multiply(preMatrix);
					selected?.current.matrix.copy(
						matrixToApply ? matrixToApply : selected.current.matrix
					);
					const pos = new THREE.Vector3();
					const quat = new THREE.Quaternion();
					const scale = new THREE.Vector3();
					matrixToApply?.decompose(pos, quat, scale);

					selected?.current.position.copy(pos);
					selected?.current.quaternion.copy(quat);
					selected?.current.scale.copy(scale);
					selected?.current?.updateMatrixWorld(true);

					console.log("rotation in euler: ", new THREE.Euler().setFromQuaternion(quat));

					dispatch(
						meshModifyIndex({
							index: 0,
							position: pos.toArray(),
							rotation: new THREE.Euler().setFromQuaternion(quat).toArray(),
						})
					);

					invalidate();
				}}
				onDragEnd={() => {
					dispatch(enableGimbal());
					if (!selected.current) return;
					if (selected.current instanceof THREE.Object3D) {
						selected.current.updateMatrixWorld(true);
					}
					const prePosition = new THREE.Vector3();
					preMatrix.decompose(prePosition, new THREE.Quaternion(), new THREE.Vector3());
					const distanceMoved = prePosition.distanceTo(selected.current.position);
					console.log(`Distance moved: ${distanceMoved}`);

					dispatch(testReducer());
				}}
				autoTransform={true}
				anchor={[0, 0, 0]}
				scale={2}
				rotation={[0, 0, 0]}
				depthTest={false}
				enabled={true}
				visible={true}>
				{/* Box is placeholder, needed to attach pivot controls */}
				<Box
					matrix={pivotMatrix}
					matrixAutoUpdate={false}
					material-color="black"
					scale={3}
				/>
			</PivotControls>
		</>
	);
};

export default PivotControlsComponent;

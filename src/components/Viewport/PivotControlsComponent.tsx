import * as React from "react";
import * as THREE from "three";
import { Box } from "@react-three/drei";
import { PivotControls } from "../custom_PivotControl";
import { useAppDispatch, useViewportSelector } from "../../hooks/useRedux";
import { testReducer } from "../../reducers/meshReducer";
import { disableGimbal, enableGimbal } from "../../reducers/viewportReducer";

// PLEASE DO NOT TOUCH
// I HAVE NO IDEA HOW THIS WORKS BUT IT DOES

// to use, pass the cube / group you want to control as the selected prop
// useGimbal is a boolean that can be toggled to tell if the gimbal is being used

const PivotControlsComponent: React.FC<{
	useGimbal?: { zoom: boolean; pan: boolean; rotate: boolean };
	selected: React.RefObject<THREE.Mesh>;
}> = ({ useGimbal: inlol, selected }) => {
	const pivotMatrix = new THREE.Matrix4();
	var preMatrix = new THREE.Matrix4();
	var preMatrixInv = new THREE.Matrix4();

	const useGimbal = useViewportSelector().useGimbal;
	const dispatch = useAppDispatch();

	return (
		<PivotControls
			onDragStart={() => {
				dispatch(disableGimbal());
				if (!selected.current) return;

				preMatrix.copy(selected.current?.matrix);
				preMatrixInv.copy(preMatrix).invert();
			}}
			onDrag={(ml, mdl, mw, mdw) => {
				if (!selected.current) return;

				const matrixToApply = selected.current?.matrix
					.copy(preMatrixInv)
					.multiply(ml)
					.multiply(preMatrix);
				selected.current?.matrix.copy(matrixToApply);
				matrixToApply?.decompose(
					selected.current?.position,
					selected.current?.quaternion,
					selected.current?.scale
				);
				selected.current?.updateMatrixWorld(true);
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
			}}
			autoTransform={true}
			anchor={[0, 0, 0]}
			scale={2}
			rotation={[0, 0, 0]}
			depthTest={false}
			enabled={true}
			visible={true}>
			{/* Box is placeholder, needed to attach pivot controls */}
			<Box matrix={pivotMatrix} matrixAutoUpdate={false} />
		</PivotControls>
	);
};

export default PivotControlsComponent;

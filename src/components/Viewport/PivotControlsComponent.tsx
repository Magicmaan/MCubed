import * as React from "react";
import * as THREE from "three";
import { Box } from "@react-three/drei";
import { PivotControls } from "../custom_PivotControl";

// PLEASE DO NOT TOUCH
// I HAVE NO IDEA HOW THIS WORKS BUT IT DOES

// to use, pass the cube / group you want to control as the selected prop
// useGimbal is a boolean that can be toggled to tell if the gimbal is being used

const PivotControlsComponent: React.FC<{
	useGimbal?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
	selected: React.RefObject<THREE.Mesh>;
}> = ({ useGimbal, selected }) => {
	const pivotMatrix = new THREE.Matrix4();
	var preMatrix = new THREE.Matrix4();
	var preMatrixInv = new THREE.Matrix4();

	return (
		<PivotControls
			onDragStart={(e) => {
				useGimbal && useGimbal[1](false);

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
				useGimbal && useGimbal[1](true);
				if (!selected.current) return;
				selected.current.updateMatrixWorld(true);
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

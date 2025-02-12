import * as React from 'react';
import * as THREE from 'three';
import { ThreeEvent, useThree } from '@react-three/fiber';
import {
	useAppDispatch,
	useMeshDataSelector,
	useMeshTextureSelector,
	useViewportSelector,
} from '../../hooks/useRedux';
import { setSelected as reduxSetSelected } from '../../redux/reducers/viewportReducer';
import Cube from './Cube';
import { CubeProps } from '../../types/three';
import { BoxUVMap } from '../../util/textureUtil';

const ModelInstance: React.FC<{
	selectionAnchorRef: React.MutableRefObject<THREE.Group<THREE.Object3DEventMap> | null>;
	usingGimbal: React.MutableRefObject<boolean>;
}> = ({ selectionAnchorRef, usingGimbal }) => {
	const renderMode = useViewportSelector().renderMode;
	const cameraControls = useViewportSelector().cameraControls;
	const modelData = useMeshDataSelector();
	const textures = useMeshTextureSelector();
	//TODO, switch to dataURL

	let texture = textures.find((texture) => texture.active === true);
	if (renderMode === 'solid' || texture === undefined) {
		texture = textures.find((texture) => texture.id === 'TEMPLATE');
	}
	const dispatch = useAppDispatch();
	const scene = useThree();

	//cube select logic
	//uses raycaster to select cubes
	const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
		if (!scene) return;
		//console.log('cameraControls', cameraControls);
		//console.log('usingGimbal', usingGimbal);
		if (usingGimbal.current) return;
		const intersects = scene.raycaster
			.intersectObjects(scene.scene.children, true)
			.filter((i) => i.object.type === 'Cube');
		if (intersects.length === 0) return;

		//console.log('intersects click', intersects);

		dispatch(reduxSetSelected(intersects[0].object.userData.id));
	};

	return (
		<group onPointerDown={handlePointerDown} type="ModelInstance">
			{modelData.map((cube, index) => (
				<Cube
					cube={cube as CubeProps}
					key={cube.id}
					index={index}
					texture={texture}
					selectionAnchorRef={selectionAnchorRef}
				/>
			))}
		</group>
	);
};

export default ModelInstance;

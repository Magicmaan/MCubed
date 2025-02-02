import * as React from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent, invalidate, useThree } from '@react-three/fiber';
import {
	useAppDispatch,
	useMeshDataSelector,
	useMeshStoreSelector,
	useMeshTextureSelector,
	useViewportCameraSelector,
	useViewportCameraSettingsSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from '../../hooks/useRedux';
import { setSelected as reduxSetSelected } from '../../redux/reducers/viewportReducer';
import Cube from './Cube';
import { CubeProps } from '../../types/three';
import { loadTexture, boxUVToVertexArray } from '../../util/textureUtil';
import { InstancedUniformsMesh } from 'three-instanced-uniforms-mesh';
import {
	Line,
	Outlines,
	Select,
	useTexture,
	Wireframe,
} from '@react-three/drei';
import { int, uv } from 'three/webgpu';
import { meshModifyIndex } from '../../redux/reducers/meshReducer';
import { is } from '@react-three/fiber/dist/declarations/src/core/utils';

const ModelInstance: React.FC<{
	selectionAnchorRef: React.MutableRefObject<THREE.Group<THREE.Object3DEventMap> | null>;
}> = ({ selectionAnchorRef }) => {
	const renderMode = useViewportSelector().renderMode;
	const modelData = useMeshDataSelector();
	const textures = useMeshTextureSelector();
	//TODO, switch to dataURL

	let texture = textures.find((texture) => texture.active === true);
	if (renderMode === 'solid' || texture === undefined) {
		texture = textures.find((texture) => texture.id === 'TEMPLATE');
	}
	const dispatch = useAppDispatch();
	const scene = useThree();
	const raycaster = scene.raycaster;
	// React.useEffect(() => {
	// 	console.log('ModelInstance', modelData);
	// }, [modelData, textures, texture]);

	const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
		if (!scene) return;
		const intersects = scene.raycaster
			.intersectObjects(scene.scene.children, true)
			.filter((i) => i.object.type === 'Cube');
		if (intersects.length === 0) return;

		console.log('intersects click', intersects);

		dispatch(reduxSetSelected(intersects[0].object.userData.id));
	};

	return (
		<group onPointerDown={handlePointerDown}>
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

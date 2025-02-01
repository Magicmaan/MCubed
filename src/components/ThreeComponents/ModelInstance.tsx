import * as React from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent, invalidate } from '@react-three/fiber';
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
import { uv } from 'three/webgpu';
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

	React.useEffect(() => {
		console.log('TEXTURE', texture);
	}, [textures, texture]);

	// React.useEffect(() => {
	// 	console.log('ModelInstance', modelData);
	// }, [modelData, textures, texture]);

	return (
		<Select onChange={(e) => console.log('SELECT COMPONENT', e)}>
			{modelData.map((cube, index) => (
				<Cube
					cube={cube as CubeProps}
					key={cube.id}
					index={index}
					texture={texture}
					selectionAnchorRef={selectionAnchorRef}
				/>
			))}
		</Select>
	);
};

export default ModelInstance;

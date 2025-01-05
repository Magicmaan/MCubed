import * as React from 'react';
import * as THREE from 'three';
import { useFrame, ThreeEvent, invalidate } from '@react-three/fiber';
import {
	useAppDispatch,
	useMeshDataSelector,
	useMeshStoreSelector,
	useViewportCameraSelector,
	useViewportCameraSettingsSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from '../../hooks/useRedux';
import { setSelected as reduxSetSelected } from '../../reducers/viewportReducer';
import Cube, { CubeProps } from './Cube';
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
import { meshModifyIndex } from '../../reducers/meshReducer';
import { is } from '@react-three/fiber/dist/declarations/src/core/utils';

const ModelInstance: React.FC<{
	selectionAnchorRef: React.MutableRefObject<THREE.Group<THREE.Object3DEventMap> | null>;
}> = ({ selectionAnchorRef }) => {
	const modelData = useMeshDataSelector();

	//TODO, switch to dataURL
	const textures = React.useMemo(
		() => [
			loadTexture('/src/assets/textures/s3.png'),
			loadTexture('/src/assets/textures/s2.png'),
			loadTexture('/src/assets/textures/s5.png'), //up
			loadTexture('/src/assets/textures/s4.png'), //down
			loadTexture('/src/assets/textures/s1.png'),
			loadTexture('/src/assets/textures/s6.png'),
			loadTexture('/src/assets/textures/UV.png'),
		],
		[]
	);

	useFrame(() => {
		// ...existing code...
	});

	//load model data into matrix positions
	React.useEffect(() => {
		// ...existing code...
	}, []);

	return (
		<>
			{modelData.map((cube, index) => (
				<Cube
					cube={cube as CubeProps}
					index={index}
					key={index}
					texture={textures[6]}
					selectionAnchorRef={selectionAnchorRef}
				/>
			))}
		</>
	);
};

export default ModelInstance;

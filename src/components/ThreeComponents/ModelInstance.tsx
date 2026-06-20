import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import Cube from './Cube';
import { Cube as CubeObject } from '../../types/mesh';

function ModelInstance() {
	const cube = useMemo(
		() =>
			new CubeObject({
				name: 'Cube',
				position: new THREE.Vector3(0, 1, 0),
				size: new THREE.Vector3(2, 2, 2),
				colour: new THREE.Color(0xffffff),
			}),
		[]
	);

	useEffect(() => {
		return () => {
			cube.dispose();
		};
	}, [cube]);

	return <Cube autoSelect cube={cube} />;
}

export default ModelInstance;

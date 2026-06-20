import * as THREE from 'three';
import { invalidate } from '@react-three/fiber';
import { useEffect, useMemo, type RefObject } from 'react';
import Cube from './Cube';
import { Cube as CubeObject } from '../../types/mesh';
import { useCubeActionBus } from '../../events/cubeActionBus';

function ModelInstance({
	cubeRef,
}: {
	cubeRef: RefObject<CubeObject | null>;
}) {
	const {
		dispatchCubeAction,
		registerCube,
		unregisterCube,
	} =
		useCubeActionBus();
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
		registerCube(cube);
		cubeRef.current = cube;
		dispatchCubeAction(cube.cubeId, { type: 'select' });
		invalidate();

		return () => {
			if (cubeRef.current === cube) {
				cubeRef.current = null;
			}
			unregisterCube(cube);
			cube.dispose();
		};
	}, [
		cube,
		cubeRef,
		dispatchCubeAction,
		registerCube,
		unregisterCube,
	]);

	return <Cube cube={cube} />;
}

export default ModelInstance;

import { ThreeEvent, invalidate } from '@react-three/fiber';
import { useEffect } from 'react';
import type { EventListener } from 'three';
import { Cube as CubeObject } from '../../types/mesh';
import {
	createCubeSnapshot,
	useCubeActionBus,
} from '../../events/cubeActionBus';

type CubeComponentProps = {
	autoSelect?: boolean;
	cube: CubeObject;
};

// The cube state lives in the cube class.
// We just use this component to render the cube and handle react specific stuff
// Also R3F is just nicer to use
function Cube({ autoSelect = false, cube }: CubeComponentProps) {
	const { dispatch, subscribe } = useCubeActionBus();

	useEffect(() => {
		let mounted = true;
		const unsubscribeFromActions = subscribe(
			'cubeAction',
			({ action, cubeId }) => {
				if (cubeId !== cube.cubeId) return;

				cube.dispatchEvent({
					type: 'action',
					action,
				});
				invalidate();
			}
		);
		const moveListener = () => {
			dispatch('cubeChanged', {
				action: {
					type: 'move',
					position: cube.position.clone(),
				},
				snapshot: createCubeSnapshot(cube),
			});
		};
		const resizeListener = () => {
			dispatch('cubeChanged', {
				action: {
					type: 'resize',
					size: cube.size,
				},
				snapshot: createCubeSnapshot(cube),
			});
		};
		const rotateListener = () => {
			dispatch('cubeChanged', {
				action: {
					type: 'rotate',
					rotation: cube.rotation.clone(),
				},
				snapshot: createCubeSnapshot(cube),
			});
		};
		const selectListener: EventListener<
			{ action: { type: 'select' } },
			'select',
			CubeObject
		> = (event) => {
			const snapshot = createCubeSnapshot(cube);

			dispatch('cubeChanged', {
				action: event.action,
				snapshot,
			});
			dispatch('cubeSelected', {
				cube,
				snapshot,
			});
		};
		const unselectListener: EventListener<
			{ action: { type: 'unselect' } },
			'unselect',
			CubeObject
		> = (event) => {
			const snapshot = createCubeSnapshot(cube);

			dispatch('cubeChanged', {
				action: event.action,
				snapshot,
			});
			dispatch('cubeUnselected', {
				cubeId: cube.cubeId,
				snapshot,
			});
		};

		// link the threejs cube events to react events
		cube.addEventListener('move', moveListener);
		cube.addEventListener('resize', resizeListener);
		cube.addEventListener('rotate', rotateListener);
		cube.addEventListener('select', selectListener);
		cube.addEventListener('unselect', unselectListener);

		dispatch('cubeMounted', {
			cube,
			snapshot: createCubeSnapshot(cube),
		});

		if (autoSelect) {
			queueMicrotask(() => {
				if (!mounted) return;

				dispatch('cubeAction', {
					action: { type: 'select' },
					cubeId: cube.cubeId,
				});
			});
		}

		return () => {
			mounted = false;
			unsubscribeFromActions();
			cube.removeEventListener('move', moveListener);
			cube.removeEventListener('resize', resizeListener);
			cube.removeEventListener('rotate', rotateListener);
			cube.removeEventListener('select', selectListener);
			cube.removeEventListener('unselect', unselectListener);
			dispatch('cubeUnmounted', {
				cubeId: cube.cubeId,
			});
			cube.removeFromParent();
		};
	}, [autoSelect, cube, dispatch, subscribe]);

	const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
		event.stopPropagation();
		dispatch('cubeAction', {
			action: { type: 'select' },
			cubeId: cube.cubeId,
		});
		invalidate();
	};

	return <primitive object={cube} onPointerDown={handlePointerDown} />;
}

export default Cube;

import { ThreeEvent, invalidate } from '@react-three/fiber';
import { useEffect } from 'react';
import { Cube as CubeObject } from '../../types/mesh';
import { useCubeActionBus } from '../../events/cubeActionBus';

type CubeComponentProps = {
	cube: CubeObject;
};




// The cube state lives in the cube class.
// We just use this component to render the cube and handle react specific stuff
// Also R3F is just nicer to use
function Cube({ cube }: CubeComponentProps) {
	const { dispatchCubeAction } = useCubeActionBus();

	useEffect(() => {
		return () => {
			cube.removeFromParent();
		};
	}, [cube]);

	const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
		event.stopPropagation();
		dispatchCubeAction(cube.cubeId, { type: 'select' });
		invalidate();
	};


	return <primitive object={cube} onPointerDown={handlePointerDown} />;
}

export default Cube;

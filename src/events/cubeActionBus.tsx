import {
	createContext,
	useContext,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { EventDispatcher, type EventListener } from 'three';
import type { Cube, CubeAction } from '../types/mesh';

type CubeActionBusEventMap = {
	cubeChanged: {
		action: CubeAction;
		cube: Cube;
	};
	cubeRegistered: {
		cube: Cube;
	};
	cubeUnregistered: {
		cubeId: string;
	};
	cubeSelected: {
		cube: Cube;
	};
	cubeUnselected: {
		cubeId: string;
	};
};

type CubeActionBusContextValue = {
	dispatchCubeAction: (cubeId: string, action: CubeAction) => void;
	getRegisteredCube: (cubeId: string) => Cube | null;
	registerCube: (cube: Cube) => void;
	selectedCube: Cube | null;
	selectedCubeId: string | null;
	selectedCubeVersion: number;
	unregisterCube: (cube: Cube) => void;
};

const CubeActionBusContext =
	createContext<CubeActionBusContextValue | undefined>(undefined);

type CubeActionBus = Omit<
	CubeActionBusContextValue,
	'selectedCube' | 'selectedCubeId' | 'selectedCubeVersion'
>;

type CreateCubeActionBusProps = {
	onCubeChanged: (cube: Cube) => void;
	onCubeSelected: (cube: Cube) => void;
	onCubeUnselected: (cubeId: string) => void;
};

type RegisteredCubeEvents = {
	moveListener: EventListener<object, 'move', Cube>;
	resizeListener: EventListener<object, 'resize', Cube>;
	rotateListener: EventListener<object, 'rotate', Cube>;
	selectListener: EventListener<
		{ action: Extract<CubeAction, { type: 'select' }> },
		'select',
		Cube
	>;
	transformListener: EventListener<object, 'transform', Cube>;
	unselectListener: EventListener<
		{ action: Extract<CubeAction, { type: 'unselect' }> },
		'unselect',
		Cube
	>;
};

function createCubeActionBus({
	onCubeChanged,
	onCubeSelected,
	onCubeUnselected,
}: CreateCubeActionBusProps): CubeActionBus {
	const cubeRegistry = new Map<string, Cube>();
	const cubeEventRegistry = new Map<string, RegisteredCubeEvents>();
	const cubeActionBus = new EventDispatcher<CubeActionBusEventMap>();
	let selectedCubeId: string | null = null;

	function emitCubeChanged(cube: Cube, action: CubeAction): void {
		cubeActionBus.dispatchEvent({
			type: 'cubeChanged',
			action,
			cube,
		});
		onCubeChanged(cube);
	}

	function emitCubeSelected(cube: Cube): void {
		selectedCubeId = cube.cubeId;
		cubeActionBus.dispatchEvent({
			type: 'cubeSelected',
			cube,
		});
		onCubeSelected(cube);
	}

	function emitCubeUnselected(cube: Cube): void {
		if (selectedCubeId === cube.cubeId) {
			selectedCubeId = null;
		}
		cubeActionBus.dispatchEvent({
			type: 'cubeUnselected',
			cubeId: cube.cubeId,
		});
		onCubeUnselected(cube.cubeId);
	}

	function dispatchActionToCube(cube: Cube, action: CubeAction): void {
		cube.dispatchEvent({
			type: 'action',
			action,
		});
	}

	function unselectCurrentCube(nextCubeId?: string): void {
		if (!selectedCubeId || selectedCubeId === nextCubeId) return;

		const selectedCube = cubeRegistry.get(selectedCubeId);
		if (!selectedCube) {
			selectedCubeId = null;
			return;
		}

		dispatchActionToCube(selectedCube, { type: 'unselect' });
	}

	function dispatchCubeAction(cubeId: string, action: CubeAction): void {
		const cube = cubeRegistry.get(cubeId);
		if (!cube) {
			console.warn(`No cube registered for action target "${cubeId}".`);
			return;
		}

		if (action.type === 'select') {
			if (selectedCubeId === cube.cubeId) return;

			unselectCurrentCube(cube.cubeId);
			dispatchActionToCube(cube, action);
			return;
		}

		if (action.type === 'unselect' && selectedCubeId !== cube.cubeId) {
			return;
		}

		dispatchActionToCube(cube, action);
	}

	function registerCube(cube: Cube): void {
		const moveListener = () => {
			emitCubeChanged(cube, {
				type: 'move',
				position: cube.position.clone(),
			});
		};
		const resizeListener = () => {
			emitCubeChanged(cube, { type: 'resize', size: cube.size });
		};
		const rotateListener = () => {
			emitCubeChanged(cube, {
				type: 'rotate',
				rotation: cube.rotation.clone(),
			});
		};
		const selectListener: RegisteredCubeEvents['selectListener'] = (
			event
		) => {
			emitCubeChanged(cube, event.action);
			emitCubeSelected(cube);
		};
		const transformListener = () => {
			emitCubeChanged(cube, {
				type: 'matrix',
				matrix: cube.matrix.clone(),
			});
		};
		const unselectListener: RegisteredCubeEvents['unselectListener'] = (
			event
		) => {
			emitCubeChanged(cube, event.action);
			emitCubeUnselected(cube);
		};

		cubeRegistry.set(cube.cubeId, cube);
		cubeEventRegistry.set(cube.cubeId, {
			moveListener,
			resizeListener,
			rotateListener,
			selectListener,
			transformListener,
			unselectListener,
		});
		cube.addEventListener('move', moveListener);
		cube.addEventListener('resize', resizeListener);
		cube.addEventListener('rotate', rotateListener);
		cube.addEventListener('select', selectListener);
		cube.addEventListener('transform', transformListener);
		cube.addEventListener('unselect', unselectListener);
		cubeActionBus.dispatchEvent({
			type: 'cubeRegistered',
			cube,
		});
	}

	function unregisterCube(cube: Cube): void {
		const registeredEvents = cubeEventRegistry.get(cube.cubeId);
		if (registeredEvents) {
			cube.removeEventListener('move', registeredEvents.moveListener);
			cube.removeEventListener('resize', registeredEvents.resizeListener);
			cube.removeEventListener('rotate', registeredEvents.rotateListener);
			cube.removeEventListener('select', registeredEvents.selectListener);
			cube.removeEventListener(
				'transform',
				registeredEvents.transformListener
			);
			cube.removeEventListener(
				'unselect',
				registeredEvents.unselectListener
			);
			cubeEventRegistry.delete(cube.cubeId);
		}

		cubeRegistry.delete(cube.cubeId);
		cubeActionBus.dispatchEvent({
			type: 'cubeUnregistered',
			cubeId: cube.cubeId,
		});
		if (selectedCubeId === cube.cubeId) {
			emitCubeUnselected(cube);
		}
	}

	function getRegisteredCube(cubeId: string): Cube | null {
		return cubeRegistry.get(cubeId) ?? null;
	}

	return {
		dispatchCubeAction,
		getRegisteredCube,
		registerCube,
		unregisterCube,
	};
}

function CubeActionBusProvider({ children }: { children: ReactNode }) {
	const busRef = useRef<CubeActionBus | null>(null);
	const selectedCubeMirrorRef = useRef<Cube | null>(null);
	const [selectedCube, setSelectedCube] = useState<Cube | null>(null);
	const [selectedCubeVersion, setSelectedCubeVersion] = useState(0);

	if (!busRef.current) {
		busRef.current = createCubeActionBus({
			onCubeChanged: (cube) => {
				if (selectedCubeMirrorRef.current?.cubeId !== cube.cubeId) return;

				setSelectedCubeVersion((version) => version + 1);
			},
			onCubeSelected: (cube) => {
				selectedCubeMirrorRef.current = cube;
				setSelectedCube(cube);
				setSelectedCubeVersion((version) => version + 1);
			},
			onCubeUnselected: (cubeId) => {
				if (selectedCubeMirrorRef.current?.cubeId !== cubeId) return;

				selectedCubeMirrorRef.current = null;
				setSelectedCube(null);
				setSelectedCubeVersion((version) => version + 1);
			},
		});
	}

	const bus = busRef.current;

	const value = useMemo(
		() => ({
			...bus,
			selectedCube,
			selectedCubeId: selectedCube?.cubeId ?? null,
			selectedCubeVersion,
		}),
		[bus, selectedCube, selectedCubeVersion]
	);

	return (
		<CubeActionBusContext.Provider value={value}>
			{children}
		</CubeActionBusContext.Provider>
	);
}

function useCubeActionBus(): CubeActionBusContextValue {
	const bus = useContext(CubeActionBusContext);
	if (!bus) {
		throw new Error(
			'useCubeActionBus must be used within CubeActionBusProvider.'
		);
	}

	return bus;
}

export { CubeActionBusProvider, useCubeActionBus };
export type { CubeActionBusContextValue, CubeActionBusEventMap };

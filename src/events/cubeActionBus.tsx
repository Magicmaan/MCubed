import {
	createContext,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import type { Cube, CubeAction } from '../types/mesh';

type Vec3Tuple = [number, number, number];

type CubeSnapshot = {
	id: string;
	matrix: Matrix4;
	name: string;
	position: Vec3Tuple;
	rotation: Vec3Tuple;
	size: Vec3Tuple;
};

type CubeActionBusEventMap = {
	cubeAction: {
		action: CubeAction;
		cubeId: string;
	};
	cubeChanged: {
		action: CubeAction;
		snapshot: CubeSnapshot;
	};
	cubeMounted: {
		cube: Cube;
		snapshot: CubeSnapshot;
	};
	cubeSelected: {
		cube: Cube;
		snapshot: CubeSnapshot;
	};
	cubeUnmounted: {
		cubeId: string;
	};
	cubeUnselected: {
		cubeId: string;
		snapshot: CubeSnapshot;
	};
};

type CubeActionBusEventName = keyof CubeActionBusEventMap;

type CubeActionBusListener<EventName extends CubeActionBusEventName> = (
	data: CubeActionBusEventMap[EventName]
) => void;

type CubeActionBusContextValue = {
	dispatch: <EventName extends CubeActionBusEventName>(
		event: EventName,
		data: CubeActionBusEventMap[EventName]
	) => void;
	subscribe: <EventName extends CubeActionBusEventName>(
		event: EventName,
		listener: CubeActionBusListener<EventName>
	) => () => void;
};

const CubeActionBusContext = createContext<
	CubeActionBusContextValue | undefined
>(undefined);

function vectorToTuple(vector: Vector3): Vec3Tuple {
	return [
		Number(vector.x.toFixed(4)),
		Number(vector.y.toFixed(4)),
		Number(vector.z.toFixed(4)),
	];
}

function eulerToTuple(euler: Euler): Vec3Tuple {
	return [
		Number(euler.x.toFixed(4)),
		Number(euler.y.toFixed(4)),
		Number(euler.z.toFixed(4)),
	];
}

function createCubeSnapshot(cube: Cube): CubeSnapshot {
	cube.updateMatrixWorld(true);

	const matrix = cube.matrixWorld.clone();
	const position = new Vector3();
	const quaternion = new Quaternion();
	const scale = new Vector3();

	matrix.decompose(position, quaternion, scale);

	return {
		id: cube.cubeId,
		matrix,
		name: cube.name,
		position: vectorToTuple(position),
		rotation: eulerToTuple(new Euler().setFromQuaternion(quaternion)),
		size: vectorToTuple(cube.size),
	};
}

function createCubeActionBus(): CubeActionBusContextValue {
	const listeners = new Map<
		CubeActionBusEventName,
		Set<CubeActionBusListener<CubeActionBusEventName>>
	>();

	function dispatch<EventName extends CubeActionBusEventName>(
		event: EventName,
		data: CubeActionBusEventMap[EventName]
	): void {
		listeners.get(event)?.forEach((listener) => {
			listener(data);
		});
	}

	function subscribe<EventName extends CubeActionBusEventName>(
		event: EventName,
		listener: CubeActionBusListener<EventName>
	): () => void {
		const eventListeners =
			listeners.get(event) ??
			new Set<CubeActionBusListener<CubeActionBusEventName>>();

		eventListeners.add(
			listener as CubeActionBusListener<CubeActionBusEventName>
		);
		listeners.set(event, eventListeners);

		return () => {
			eventListeners.delete(
				listener as CubeActionBusListener<CubeActionBusEventName>
			);

			if (eventListeners.size === 0) {
				listeners.delete(event);
			}
		};
	}

	return {
		dispatch,
		subscribe,
	};
}

function CubeActionBusProvider({ children }: { children: ReactNode }) {
	const [bus] = useState(createCubeActionBus);
	const value = useMemo(() => bus, [bus]);

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

export { CubeActionBusProvider, createCubeSnapshot, useCubeActionBus };
export type {
	CubeActionBusContextValue,
	CubeActionBusEventMap,
	CubeSnapshot,
	Vec3Tuple,
};

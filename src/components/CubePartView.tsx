import {
	type AriaAttributes,
	type InputHTMLAttributes,
	type PointerEvent,
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Euler, Vector3 } from 'three';
import { useCubeActionBus } from '../events/cubeActionBus';
import SideBarWidget from './templates/SideBarWidget';

function DisplayVec3({
	label,
	value,
	onChange,
	step,
}: {
	label: string;
	value: [number, number, number];
	onChange: (value: [number, number, number]) => void;
	step?: SliderStep;
} & AriaAttributes) {
	return (
		<div className="pointer-events-auto flex h-auto w-full flex-col items-start justify-center gap-2 rounded-sm border-main-800 bg-main-500 p-1 text-sm">
			<label className="ml-4" id={`${label}-vec3`}>
				{label}
			</label>

			<div className="flex h-auto w-full flex-row items-center justify-between overflow-hidden px-2">
				<fieldset className="grid w-full grid-cols-3 gap-px p-1">
					{value.map((item, index) => (
						<SliderNumber
							aria-label={`${label}-${index}`}
							defaultStep={step}
							key={`${label}-${index}`}
							value={item}
							setValue={(newValue) => {
								const newValues = [
									...value,
								] as [number, number, number];
								newValues[index] = newValue;
								onChange(newValues);
							}}
						/>
					))}
				</fieldset>
			</div>
		</div>
	);
}

type SliderStep = 0.1 | 0.25 | 1 | 2;

type SliderDragState = {
	remainder: number;
	value: number;
};

const dragPixelsPerStep = 8;

async function lockMouse(element: HTMLElement) {
	const pointerLockRequest = element.requestPointerLock();
	if (pointerLockRequest instanceof Promise) {
		await pointerLockRequest;
	}
}

function unlockMouse() {
	if (document.pointerLockElement) {
		document.exitPointerLock();
	}
}

function SliderNumber({
	value,
	setValue,
	defaultStep,
	...props
}: {
	value: number;
	setValue: (newValue: number) => void;
	defaultStep?: SliderStep;
} & Omit<
	InputHTMLAttributes<HTMLInputElement>,
	| 'onPointerDown'
	| 'onPointerMove'
	| 'onPointerUp'
	| 'onPointerCancel'
	| 'onChange'
	| 'value'
>) {
	const [interval] = useState<SliderStep>(defaultStep ?? 0.1);
	const inputRef = useRef<HTMLInputElement>(null);
	const dragRef = useRef<SliderDragState | null>(null);

	const applyDragDelta = useCallback((delta: number) => {
		const drag = dragRef.current;
		if (!drag || !inputRef.current) return;

		drag.remainder += delta;
		const steps = Math.trunc(drag.remainder / dragPixelsPerStep);
		if (steps === 0) return;

		drag.remainder -= steps * dragPixelsPerStep;
		drag.value = Number((drag.value + steps * interval).toFixed(4));
		inputRef.current.value = String(drag.value);
		setValue(drag.value);
	}, [interval, setValue]);

	const handleMouseMove = useCallback((event: MouseEvent) => {
		applyDragDelta(event.movementX - event.movementY);
	}, [applyDragDelta]);

	const stopDrag = useCallback(() => {
		if (!dragRef.current) return;

		dragRef.current = null;
		unlockMouse();
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', stopDrag);
		document.removeEventListener('pointerlockchange', handlePointerLockChange);
	}, [handleMouseMove]);

	const handlePointerLockChange = useCallback(() => {
		if (!document.pointerLockElement) {
			stopDrag();
		}
	}, [stopDrag]);

	const handlePointerDown = useCallback(async (event: PointerEvent<HTMLInputElement>) => {
		event.currentTarget.focus();
		dragRef.current = {
			remainder: 0,
			value,
		};
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', stopDrag);
		document.addEventListener('pointerlockchange', handlePointerLockChange);

		try {
			await lockMouse(event.currentTarget);
		} catch {
			stopDrag();
		}
	}, [handleMouseMove, handlePointerLockChange, setValue, stopDrag, value]);

	return (
		<input
			ref={inputRef}
			step={interval}
			role="spinbutton"
			className="cursor-ew-resize bg-red-500 flex text-center pixel-border-4 ring-amber-400"
			value={value}
			onChange={(event) => setValue(Number(event.target.value))}
			data-step={interval}
			onPointerDown={handlePointerDown}
			onFocus={(event) => {
				event.currentTarget.setAttribute('data-focused', 'true');
				event.currentTarget.setAttribute('aria-current', 'true');
			}}
			onBlur={(event) => {
				event.currentTarget.removeAttribute('data-focused');
				event.currentTarget.removeAttribute('aria-current');
			}}
			{...props}
		/>
	);
}

function vectorToTuple(vector: Vector3): [number, number, number] {
	return [
		Number(vector.x.toFixed(4)),
		Number(vector.y.toFixed(4)),
		Number(vector.z.toFixed(4)),
	];
}

function eulerToTuple(euler: Euler): [number, number, number] {
	return [
		Number(euler.x.toFixed(4)),
		Number(euler.y.toFixed(4)),
		Number(euler.z.toFixed(4)),
	];
}

function CubePartView() {
	const {
		dispatchCubeAction,
		selectedCube,
		selectedCubeId,
		selectedCubeVersion,
	} = useCubeActionBus();

	const size = useMemo(() => {
		if (!selectedCube) return [0, 0, 0] as [number, number, number];

		return vectorToTuple(selectedCube.size);
	}, [selectedCube, selectedCubeVersion]);

	const position = useMemo(() => {
		if (!selectedCube) return [0, 0, 0] as [number, number, number];

		return vectorToTuple(selectedCube.position);
	}, [selectedCube, selectedCubeVersion]);

	const rotation = useMemo(() => {
		if (!selectedCube) return [0, 0, 0] as [number, number, number];

		return eulerToTuple(selectedCube.rotation);
	}, [selectedCube, selectedCubeVersion]);

	const updateSize = useCallback(
		(value: [number, number, number]) => {
			if (!selectedCubeId) return;

			dispatchCubeAction(selectedCubeId, {
				type: 'resize',
				size: new Vector3(value[0], value[1], value[2]),
			});
		},
		[dispatchCubeAction, selectedCubeId]
	);

	const updatePosition = useCallback(
		(value: [number, number, number]) => {
			if (!selectedCubeId) return;

			dispatchCubeAction(selectedCubeId, {
				type: 'move',
				position: new Vector3(value[0], value[1], value[2]),
			});
		},
		[dispatchCubeAction, selectedCubeId]
	);

	const updateRotation = useCallback(
		(value: [number, number, number]) => {
			if (!selectedCubeId) return;

			dispatchCubeAction(selectedCubeId, {
				type: 'rotate',
				rotation: new Euler(value[0], value[1], value[2]),
			});
		},
		[dispatchCubeAction, selectedCubeId]
	);

	return (
		<SideBarWidget name="Cube">
			<div className="flex h-5/6 min-h-72 w-full flex-col items-center justify-center gap-1 overflow-scroll">
				<p className="text-[0.5rem] text-gray-500">
					{selectedCube?.name ?? 'No cube selected'}
				</p>
				<DisplayVec3
					label="Size"
					onChange={updateSize}
					step={2}
					value={size}
				/>
				<DisplayVec3
					label="Position"
					onChange={updatePosition}
					value={position}
				/>
				<DisplayVec3
					label="Rotation"
					onChange={updateRotation}
					value={rotation}
				/>
			</div>
		</SideBarWidget>
	);
}

export default CubePartView;

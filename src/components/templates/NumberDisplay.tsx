import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MenuItem } from '../../hooks/useContextMenu';
import ContextMenu from '../ContextMenu';
import { useModifiers } from '../../hooks/useControls';
import { modifiers, moveModifierIncrement } from '../../constants/KeyModifiers';
import {
	Menu,
	Item,
	Separator,
	Submenu,
	useContextMenu,
} from 'react-contexify';
import {
	ContextCopyPasteItem,
	ContextInfoItem,
	ContextItem,
} from './ContextMenu';
import Icon from '../../assets/icons/solid/.all';
import { v4 as uuid } from 'uuid';
import { ErrorBoundary } from 'react-error-boundary';

const NumberDisplayVec3 = ({
	vec,
	setVec,
	orientation = 'row',
	size = 'medium',
	decimalPlaces = 2,
}: {
	vec: [number, number, number];
	setVec?: (x: number, y: number, z: number) => void;
	orientation?: 'column' | 'row';
	size?: 'small' | 'medium' | 'large';
	decimalPlaces?: number;
}) => {
	const vectorAxis = ['X', 'Y', 'Z'];
	return (
		<div
			className={
				'flex h-min w-min items-center justify-between gap-1 rounded-md text-sm' +
				(orientation == 'column' ? ' flex-col' : ' flex-row')
			}
		>
			{vec.map((item, index) => {
				return (
					<NumberDisplaySingle
						value={item}
						axis={vectorAxis[index] as 'X' | 'Y' | 'Z'}
						key={index}
						index={index}
						size={size}
						decimalPlaces={decimalPlaces}
						setValue={(value) => {
							if (setVec) {
								var newVec = [...vec];
								newVec[index] = value;
								setVec(newVec[0], newVec[1], newVec[2]);
							}
						}}
					/>
				);
			})}
		</div>
	);
};

const NumberDisplaySingle = ({
	value,
	index,
	setValue,
	axis,
	size = 'medium',
	decimalPlaces = 2,
}: {
	value: number;
	index: number;
	setValue?: (arg0: number) => void;
	axis?: 'X' | 'Y' | 'Z';
	size?: 'small' | 'medium' | 'large';
	decimalPlaces?: number;
}) => {
	const contextMenuID = `vector_single_${uuid()}`;
	const { show } = useContextMenu({ id: contextMenuID });
	const handleContextMenu = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		show({ event });
		event.preventDefault();
	};

	const [inputValue, setInputValue] = useState(value.toFixed(decimalPlaces));

	useEffect(() => {
		setInputValue(value.toFixed(decimalPlaces));
	}, [value, decimalPlaces]);

	const vectorColour = {
		X: 'border-red-axis',
		Y: 'green-axis',
		Z: 'blue-axis',
	};
	var vectorTextSize: string;
	var vectorTextYOffset: string = 'bottom-2';
	var vectorTextXOffset: string = 'left-2';
	var width: string;
	var height: string;
	var textSize: string;
	var borderRadius: string = 'rounded-md';
	var borderWidth: string = 'border-b-4';
	const { getMultiplier } = useModifiers();

	switch (size) {
		case 'small':
			textSize = 'text-sm';
			width = 'w-16';
			height = 'h-5';
			vectorTextSize = 'text-2xl';
			borderRadius = 'rounded-sm';
			borderWidth = 'border-b-2';
			vectorTextYOffset = 'bottom-2';
			break;
		case 'medium':
			vectorTextSize = 'text-3xl';
			width = 'w-16';
			height = 'h-6';
			textSize = 'text-sm';
			break;
		case 'large':
			vectorTextSize = 'text-5xl';
			width = 'w-20';
			height = 'h-8';
			textSize = 'text-base';
			break;
	}
	const allowedKeys = [
		'0',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'.',
		'+',
		'-',
		'/',
		'*',
		'Backspace',
		'ArrowLeft',
		'ArrowRight',
		'ArrowUp',
		'ArrowDown',
		'Delete',
		'Escape',
		'Shift',
		'Control',
		'Alt',
		'r',
		't',
		'f',
	];

	return (
		<ErrorBoundary
			onError={(error, componentStack) => console.log(error)}
			FallbackComponent={Fallback}
		>
			<div
				className={
					`pointer-events-auto flex flex-row items-center justify-start overflow-hidden border-2 bg-secondary p-1 py-0.5 text-left ${width} ${height} ${textSize} ${borderRadius}` +
					vectorColour['X'] +
					'border-red-axis'
				}
				onContextMenuCapture={(e) => handleContextMenu(e)}
			>
				<input
					type="text"
					value={inputValue}
					inputMode="decimal"
					className="pointer-events-auto flex h-full w-10 min-w-10 max-w-10 items-start justify-start border-none bg-transparent text-start outline-none"
					tabIndex={index * 10 + Math.round(Math.random() * 10)}
					onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
						if (e.key === 'Enter') e.currentTarget.blur();
						if (!allowedKeys.includes(e.key)) {
							e.preventDefault();
							return;
						}
						if (e.key === 'ArrowUp' && setValue)
							setValue(value + 1);
						if (e.key === 'ArrowDown' && setValue)
							setValue(value - 1);
						if (e.key === 'r' && setValue)
							setValue(Math.round(value));
						if (e.key === 't' && setValue)
							setValue(Math.trunc(value));
						if (e.key === 'f' && setValue) setValue(-value);
						if (e.key === 'Escape') e.currentTarget.blur();
					}}
					onChange={() => {}}
					onBlur={(e) => {
						let text = e.target.value;
						if (
							['+', '-', '*', '/'].some((op) => text.includes(op))
						) {
							const firstTwoChars = text.slice(0, 2);
							if (
								['++', '+-', '-+', '--'].includes(firstTwoChars)
							) {
								text =
									value.toFixed(decimalPlaces) +
									(firstTwoChars[1] === '+' ? '+1' : '-1');
							}
							if (['+', '-', '*', '/'].includes(text[0])) {
								text = value + text;
							}
							try {
								text = eval(text);
							} catch {
								text = value.toFixed(decimalPlaces);
							}
						}
						if (!text || isNaN(parseFloat(text))) {
							text = value.toFixed(decimalPlaces);
						}
						if (setValue) setValue(parseFloat(text));
					}}
					onFocus={(e) => e.target.select()}
				/>
				{axis && (
					<div
						className={`text-red bg-red relative h-full w-full items-center justify-center text-end font-bold opacity-75 text-${vectorColour[axis]} ${vectorTextSize} ${vectorTextYOffset} ${vectorTextXOffset}`}
					>
						{axis}
					</div>
				)}
				<Menu
					id={contextMenuID}
					theme="contextTheme"
					className="bg-red-500"
				>
					<ContextInfoItem
						label={axis + ' ' + value}
						textSize="text-xs"
					/>
					<ContextItem
						label="Flip"
						title="Flip the value"
						shortcutLabel="F"
						callback={() => setValue && setValue(-value)}
						icon={'mirror'}
					/>
					<ContextItem
						label="Round"
						title="Round to nearest whole number"
						shortcutLabel="R"
						canClick={true}
						callback={() => setValue && setValue(Math.round(value))}
						icon={'arrows-down-to-line'}
					/>
					<ContextItem
						label="Truncate"
						title="Truncate decimals"
						shortcutLabel="T"
						canClick={true}
						callback={() => setValue && setValue(Math.trunc(value))}
						icon={'border-all'}
					/>
					<ContextItem
						label="To Zero"
						title="Set value to zero"
						shortcutLabel="0"
						canClick={true}
						callback={() => setValue && setValue(0)}
						icon={'arrows-to-dot'}
					/>
					<Separator />
					<ContextCopyPasteItem />
					<Separator />
					<ContextInfoItem label="Operators" textSize="text-sm" />
					<ContextInfoItem label="Add Subtract" shortcutLabel="+ -" />
					<ContextInfoItem
						label="Multiply Divide"
						shortcutLabel="* /"
					/>
					<ContextInfoItem
						label="Increment"
						shortcutLabel="Arrow Up | ++"
					/>
					<ContextInfoItem
						label="Decrement"
						shortcutLabel="Arrow Down | --"
					/>
				</Menu>
			</div>
		</ErrorBoundary>
	);
};

function Fallback({ error, resetErrorBoundary }) {
	// Call resetErrorBoundary() to reset the error boundary and retry the render.

	return (
		<div role="alert">
			<p>Something went wrong:</p>
			<pre style={{ color: 'red' }}>{error.message}</pre>
		</div>
	);
}

export { NumberDisplayVec3, NumberDisplaySingle };

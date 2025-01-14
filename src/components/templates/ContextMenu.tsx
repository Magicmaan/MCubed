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
import Icon from '../../assets/icons/solid/.all';

interface ContextItemProps {
	label: string;
	shortcutLabel?: string;
	title?: string;
	canClick?: boolean;
	callback?: () => void;
	icon?: string;
}

const ContextItem: React.FC<ContextItemProps> = ({
	label = 'Context Item',
	shortcutLabel = '',
	title,
	canClick = true,
	callback,
	icon,
}) => {
	return (
		<Item id={label} onClick={canClick ? callback : undefined}>
			<div
				className="flex h-full w-full flex-row items-center justify-between text-sm"
				title={title ? title : label}
			>
				<div className="flex h-auto w-auto select-none flex-row items-center justify-start gap-2">
					<Icon
						name={icon ?? 'cube'}
						height={16}
						width={16}
						colour="rgb(168, 168, 168)"
					/>
					<p className="text-text">{label}</p>
				</div>

				{shortcutLabel && (
					<p className="text-text-secondary m-0 flex h-full w-auto items-center justify-center rounded-md border-none p-0 text-center text-xs">
						{shortcutLabel}
					</p>
				)}
			</div>
		</Item>
	);
};
interface ContextInfoItemProps {
	label: string;
	shortcutLabel?: string;
	title?: string;
	icon?: string;
	textSize?: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg' | 'text-xl';
}

const ContextInfoItem: React.FC<ContextInfoItemProps> = ({
	label = 'Context Info Item',
	shortcutLabel = '',
	title,
	icon,
	textSize = 'text-xs',
}) => {
	return (
		<Item id={label} disabled className="h-auto py-0">
			<div
				className="my-0 flex h-full w-full flex-row items-center justify-between py-0"
				title={title ? title : label}
			>
				<div className="flex h-auto w-auto flex-row items-center justify-start gap-2">
					<Icon
						name={icon}
						height={16}
						width={16}
						colour="rgb(168, 168, 168)"
					/>
					<p className={`text-text ${textSize}`}>{label}</p>
				</div>

				{shortcutLabel && (
					<p className="text-text-secondary m-0 flex h-full w-auto items-center justify-center rounded-md border-none p-0 text-center text-xs">
						{shortcutLabel.toUpperCase()}
					</p>
				)}
			</div>
		</Item>
	);
};

const ContextCopyPasteItem: React.FC<{
	shiftKey?: boolean;
	copyTitle?: string;
	pasteTitle?: string;
	copyFunc?: () => void;
	pasteFunc?: () => void;
}> = ({ shiftKey = false, copyTitle, pasteTitle, copyFunc, pasteFunc }) => {
	const copyShortcut = shiftKey ? 'Ctrl Shift C' : 'Ctrl C';
	const pasteShortcut = shiftKey ? 'Ctrl Shift V' : 'Ctrl V';
	return (
		<>
			<ContextItem
				label="Copy"
				icon="copy"
				shortcutLabel={copyShortcut}
				title={copyTitle}
				callback={copyFunc}
			/>
			<ContextItem
				label="Paste"
				icon="paste"
				shortcutLabel={pasteShortcut}
				title={pasteTitle}
				callback={pasteFunc}
			/>
		</>
	);
};

export { ContextItem, ContextInfoItem, ContextCopyPasteItem };

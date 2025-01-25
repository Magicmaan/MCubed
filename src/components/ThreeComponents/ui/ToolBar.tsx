import React from 'react';
import Icon from '../../../assets/icons/solid/.all';
import { Button } from '../../ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../../ui/select';
import DisplayDropDown from './DisplayDropDown';
import { useAppDispatch, useViewportSelector } from '../../../hooks/useRedux';

interface WidgetProps {
	width: string;
}

const Widget: React.FC<{ width?: number; children?: React.ReactNode }> = ({
	width: inWidth,
	children,
}) => {
	return (
		<Button
			variant="outline"
			className={`m-0 aspect-square h-8 items-center justify-center p-0`}
		>
			<div className="flex h-full w-auto flex-row items-center justify-center">
				{children}
			</div>
		</Button>
	);
};

const LongWidget: React.FC<{ width?: number; children?: React.ReactNode }> = ({
	width = 'auto',
	children,
}) => {
	return (
		<div
			style={{ width: width }}
			className={`h-full select-none items-center justify-center rounded-full bg-tertiary p-2`}
		>
			<div className="flex h-full w-full select-none flex-row items-center justify-center text-nowrap">
				{children}
			</div>
		</div>
	);
};

const ToolBar: React.FC<{
	children?: React.ReactNode;
	dispatch?: any;
}> = ({ dispatch, children }) => {
	return (
		<div className="flex h-auto w-full flex-grow gap-2">
			<div className="pointer-events-auto flex h-12 w-full items-center justify-start gap-1 rounded-md bg-main-700 p-1 px-4">
				<Widget>
					<Icon
						name="arrows-up-down-left-right"
						width={18}
						colour="#cacaca"
					/>
				</Widget>
				<Widget>
					<Icon name="arrows-to-dot" width={18} colour="#cacaca" />
				</Widget>
				<Widget>
					<Icon name="arrows-rotate" width={18} colour="#cacaca" />
				</Widget>
				<Widget>
					<Icon name="arrows-to-circle" width={18} colour="#cacaca" />
				</Widget>
				<div className="flex-grow" />
				<DisplayDropDown dispatch={dispatch} />
				{children}
			</div>
		</div>
	);
};

export default ToolBar;

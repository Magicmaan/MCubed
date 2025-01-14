import React from 'react';
import Icon from '../../assets/icons/solid/.all';

interface SideBarWidgetProps {
	style?: React.CSSProperties;
	name: string;
	children?: React.ReactNode;
	showExitButton?: boolean;
	onExit?: () => void;
	className?: string;
}

const SideBarWidget: React.FC<SideBarWidgetProps> = ({
	style,
	className,
	name,
	children,
	showExitButton,
	onExit,
}) => {
	return (
		<div
			id={name}
			className={`scrollbar scrollbar-always flex h-auto w-full flex-col flex-nowrap items-stretch justify-stretch space-y-0.5 overflow-y-scroll rounded-md bg-main p-2 ${className}`}
			style={style}
		>
			<div className="flex h-auto w-full select-none flex-row flex-nowrap items-center justify-between">
				<p className="border-1 static p-2 pr-4 text-left font-Inter font-semibold">
					{name}
				</p>
				{showExitButton && (
					<button
						onClick={onExit}
						className="m-1 flex aspect-square h-full items-center justify-center rounded-lg bg-slate-600 p-0 pr-1"
					>
						<Icon
							name="xmark"
							height={24}
							width={24}
							colour="#2a2d30"
							alt_text="exit"
							center_x
						/>
					</button>
				)}
			</div>
			{children}
		</div>
	);
};

export default SideBarWidget;

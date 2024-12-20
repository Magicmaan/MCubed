import React from "react";
import Icon from "../../assets/icons/solid/.all";

interface SideBarWidgetProps {
	style?: React.CSSProperties;
	name: string;
	children?: React.ReactNode;
	showExitButton?: boolean;
	onExit?: () => void;
}

const SideBarWidget: React.FC<SideBarWidgetProps> = ({
	style,
	name,
	children,
	showExitButton,
	onExit,
}) => {
	return (
		<div
			id={name}
			className="bg-main w-full h-auto max-h-full flex flex-nowrap flex-col space-y-0.5 p-2 rounded-xl overflow-y-scroll scrollbar scrollbar-always justify-stretch items-stretch"
			style={style}>
			<div className="flex flex-row flex-nowrap justify-between items-center w-full h-auto select-none">
				<p className="font-Inter font-semibold text-left p-2 pr-4 border-1 static">
					{name}
					<div className="flex-grow h-1"></div>
				</p>
				{showExitButton && (
					<button
						onClick={onExit}
						className="aspect-square h-full flex p-0 m-1 pr-1 justify-center items-center rounded-lg bg-slate-600 ">
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

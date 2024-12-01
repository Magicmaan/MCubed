import React from "react";

interface SideBarWidgetProps {
	style?: React.CSSProperties;
	name: string;
	children?: React.ReactNode;
}

const SideBarWidget: React.FC<SideBarWidgetProps> = ({ style, name, children }) => {
	return (
		<div
			id={name}
			className="bg-main w-full h-full flex flex-nowrap flex-col space-y-0.5 p-2 rounded-xl overflow-y-scroll"
			style={style}>
			<p className="font-Inter font-semibold  text-left p-2 pr-4 border-1 border-red-400">
				{name}
			</p>
			{children}
		</div>
	);
};

export default SideBarWidget;

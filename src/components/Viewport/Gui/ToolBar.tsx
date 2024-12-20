import React from "react";
import Icon from "../../../assets/icons/solid/.all";

interface WidgetProps {
	width: string;
}

const Widget: React.FC<{ width?: number; children?: React.ReactNode }> = ({
	width: inWidth,
	children,
}) => {
	return (
		<div
			className={`h-full aspect-square bg-tertiary rounded-full p-2 justify-center items-center`}>
			<div className="w-full h-full flex flex-row justify-center items-center">
				{children}
			</div>
		</div>
	);
};

const LongWidget: React.FC<{ width?: number; children?: React.ReactNode }> = ({
	width = "auto",
	children,
}) => {
	return (
		<div
			style={{ width: width }}
			className={`h-full bg-tertiary rounded-full p-2 justify-center items-center`}>
			<div className="w-full h-full flex justify-center items-center flex-row text-nowrap select-none">
				{children}
			</div>
		</div>
	);
};

const ToolBar: React.FC = () => {
	return (
		<div className=" w-auto h-auto flex gap-2">
			<div className="bg-main w-auto h-full flex gap-2 rounded-full p-1 px-4 items-center justify-center">
				<Widget>
					<Icon name="arrows-up-down-left-right" width={18} colour="#cacaca" />
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
			</div>
			<div className="bg-main w-auto h-full flex gap-2 rounded-full p-1 px-4 items-center justify-center ">
				<LongWidget width={"auto"}>Transform mode</LongWidget>
			</div>
		</div>
	);
};

export default ToolBar;

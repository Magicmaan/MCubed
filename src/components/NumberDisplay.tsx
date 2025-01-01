import useContextMenu from "../hooks/useContextMenu";
import ContextMenu from "./ContextMenu";

const NumberDisplayVec3 = ({
	vec,
	orientation = "row",
	size = "medium",
	decimalPlaces = 2,
}: {
	vec: [number, number, number];
	orientation?: "column" | "row";
	size?: "small" | "medium" | "large";
	decimalPlaces?: number;
}) => {
	const { menuVisible, menuItems, menuPosition, showMenu, hideMenu, handleContextMenu } =
		useContextMenu();
	const vectorAxis = ["X", "Y", "Z"];

	return (
		<div
			className={
				"text-sm flex justify-between items-center w-min h-min  rounded-md gap-1" +
				(orientation == "column" ? " flex-col" : " flex-row")
			}>
			{vec.map((item, index) => {
				return (
					<NumberDisplaySingle
						value={item}
						axis={vectorAxis[index] as "X" | "Y" | "Z"}
						size={size}
						decimalPlaces={decimalPlaces}
					/>
				);
			})}
		</div>
	);
};

const NumberDisplaySingle = ({
	value,
	axis,
	size = "medium",
	decimalPlaces = 2,
}: {
	value: number;
	axis?: "X" | "Y" | "Z";
	size?: "small" | "medium" | "large";
	decimalPlaces?: number;
}) => {
	const { menuVisible, menuItems, menuPosition, showMenu, hideMenu, handleContextMenu } =
		useContextMenu();
	const vectorColour = {
		X: "red-500",
		Y: "green-500",
		Z: "blue-500",
	};
	var vectorTextSize: string;
	var vectorTextYOffset: string = "bottom-2";
	var vectorTextXOffset: string = "left-2";
	var width: string;
	var height: string;
	var textSize: string;
	var borderRadius: string = "rounded-md";
	var borderWidth: string = "border-b-4";

	switch (size) {
		case "small":
			textSize = "text-sm";
			width = "w-16";
			height = "h-5";
			vectorTextSize = "text-2xl";
			borderRadius = "rounded-sm";
			borderWidth = "border-b-2";
			vectorTextYOffset = "bottom-2";
			break;
		case "medium":
			vectorTextSize = "text-3xl";
			width = "w-16";
			height = "h-6";
			textSize = "text-sm";
			break;
		case "large":
			vectorTextSize = "text-5xl";
			width = "w-20";
			height = "h-8";
			textSize = "text-base";
			break;
	}

	return (
		<div
			className={`bg-secondary p-1 py-0.5 justify-start items-center flex-row flex text-left overflow-hidden border-border border-b-2
							${width} ${height} ${textSize} ${borderRadius}`}
			onContextMenu={(e) => {
				handleContextMenu(e, menuItems);
			}}>
			<div className="h-full w-10 min-w-10 max-w-10 text-start justify-start items-start flex ">
				{value.toFixed(decimalPlaces)}
			</div>

			{axis && (
				<div
					className={`w-full h-full justify-center items-center text-end relative opacity-50 font-bold  
					text-${vectorColour[axis]} ${vectorTextSize} ${vectorTextYOffset} ${vectorTextXOffset}`}>
					{axis}
				</div>
			)}

			<ContextMenu
				id={"position_single"}
				visible={menuVisible}
				items={menuItems}
				position={menuPosition}
			/>
		</div>
	);
};

export { NumberDisplayVec3, NumberDisplaySingle };

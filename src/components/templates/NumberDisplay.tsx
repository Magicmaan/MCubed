import { useEffect, useRef, useState } from "react";
import useContextMenu from "../../hooks/useContextMenu";
import ContextMenu from "../ContextMenu";
import { useModifiers } from "../../hooks/useControls";
import { modifiers, moveModifierIncrement } from "../../constants/KeyModifiers";

const NumberDisplayVec3 = ({
	vec,
	setVec,
	orientation = "row",
	size = "medium",
	decimalPlaces = 2,
}: {
	vec: [number, number, number];
	setVec?: (x: number, y: number, z: number) => void;
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
						key={index}
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
	setValue,
	axis,
	size = "medium",
	decimalPlaces = 2,
}: {
	value: number;
	setValue?: (arg0: number) => void;
	axis?: "X" | "Y" | "Z";
	size?: "small" | "medium" | "large";
	decimalPlaces?: number;
}) => {
	const { menuVisible, menuItems, menuPosition, showMenu, hideMenu, handleContextMenu } =
		useContextMenu();
	const [inputValue, setInputValue] = useState<string>(value.toFixed(decimalPlaces));

	useEffect(() => {
		setInputValue(value.toFixed(decimalPlaces));
	}, [value]);
	const contextItems = [
		{
			label: "Round",
			action: () => {
				if (setValue) {
					setValue(Math.round(value));
					value = Math.round(value);
					setInputValue(value.toFixed(decimalPlaces));
				}
			},
			icon: "arrows-down-to-line",
		},
		{
			label: "Truncate",
			action: () => {
				if (setValue) {
					setValue(Math.trunc(value));
					value = Math.trunc(value);
				}
			},
			icon: "border-all",
		},
		{
			label: "To Zero",
			action: () => {
				if (setValue) {
					setValue(0);
					value = 0;
				}
			},
			icon: "arrows-to-dot",
		},
		// More menu items...
	];

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
	const keyModifiers = useModifiers();

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

	const allowedKeys = [
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"+",
		"-",
		"/",
		"*",
		"Backspace",
		"ArrowLeft",
		"ArrowRight",
		"ArrowUp",
		"ArrowDown",
		"Delete",
		"Escape",
		"Shift",
		"Control",
		"Alt",
	];

	return (
		<div
			className={`bg-secondary p-1 py-0.5 justify-start items-center flex-row flex text-left overflow-hidden border-border border-b-2
							${width} ${height} ${textSize} ${borderRadius}`}
			onContextMenuCapture={(e) => {
				console.log("Context Menu Capture");
			}}
			onContextMenu={(e) => {
				console.log("Context Menu");
				handleContextMenu(e, contextItems);
				e.preventDefault();
			}}>
			<input
				type="text"
				inputMode="decimal"
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.currentTarget.blur();
					}

					if (!allowedKeys.includes(e.key)) {
						e.preventDefault();
						return;
					}
					console.log("Key", e.key);
					if (e.key === "ArrowUp") {
						if (setValue) {
							var toAdd = 1;
							if (keyModifiers.small_shift[0]) {
								toAdd *= moveModifierIncrement.small_shift;
							} else if (keyModifiers.x_small_shift[0]) {
								toAdd *= moveModifierIncrement.x_small_shift;
							}
							setValue(value + toAdd);
							value = value + toAdd;
						}
					}
					if (e.key === "ArrowDown") {
						if (setValue) {
							setValue(value - 1);
							value = value - 1;
						}
					}

					if (e.key === "Escape") {
						e.target.blur();
					}
				}}
				className="h-full w-10 min-w-10 max-w-10 text-start justify-start items-start flex bg-transparent border-none outline-none"
				value={inputValue}
				onChange={(e) => {
					const text = e.target.value;
					console.log("Change", text);
					setInputValue(text);
				}}
				onBlur={(e) => {
					var text = e.target.value;
					if (
						text.includes("+") ||
						text.includes("-") ||
						text.includes("*") ||
						text.includes("/")
					) {
						// single operators
						// ++ to add 1
						// +- to subtract 1
						// -+ to add 1
						// -- to subtract 1

						const firstTwoChars = text.slice(0, 2);
						if (firstTwoChars === "++") {
							text = value.toFixed(decimalPlaces) + "+1";
						}
						if (firstTwoChars === "+-") {
							text = value.toFixed(decimalPlaces) + "-1";
						}
						if (firstTwoChars === "-+") {
							text = value.toFixed(decimalPlaces) + "+1";
						}
						if (firstTwoChars === "--") {
							text = value.toFixed(decimalPlaces) + "-1";
						}

						//if first character is expression, add current value to the start
						if (
							text[0] === "+" ||
							text[0] === "-" ||
							text[0] === "*" ||
							text[0] === "/"
						) {
							text = value + text;
						}

						try {
							text = eval(text);
						} catch (e) {
							console.log("Invalid expression");
						}
					}
					//error catch incase expression is nan or undefined
					if (text === undefined || text === "" || isNaN(parseFloat(text))) {
						text = value.toFixed(decimalPlaces);
					}

					if (setValue) {
						setValue(parseFloat(text));
						value = parseFloat(text);
					}

					setInputValue(value.toFixed(decimalPlaces));
					e.target.value = value.toFixed(decimalPlaces);
				}}
				onFocus={(e) => {
					console.log("e.target", e);
					e.target.select();
					console.log("Focus");

					//setInputValue(value.toFixed(decimalPlaces));
					//e.target.value = value.toFixed(decimalPlaces);
				}}
			/>

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
				hideMenu={hideMenu}
				items={contextItems}
				position={menuPosition}
			/>
		</div>
	);
};

export { NumberDisplayVec3, NumberDisplaySingle };

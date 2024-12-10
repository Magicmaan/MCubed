import React, { useRef, useEffect } from "react";
import { modifiers, modifierIncrement } from "../constants/KeyModifiers";
//TODO Seperate the input components into their own files
const InputSingle = ({
	name,
	inputType,
	value,
	setValue,
}: {
	name: string;
	inputType: "Position" | "Size" | "Pivot" | "Rotate";
	value: string;
	setValue: (arg0: number) => void;
}) => {
	const [valueRef, setValueRef] = React.useState(value);
	//store two most recent key presses
	const key_press = useRef<string[]>(["", ""]);
	const handleDecrement = () => {
		// Get the most recent key presses
		// if valid modifier / modifier combination, get the modifier
		// decrement value
		const modifierKey = key_press.current.join("") as keyof typeof modifierIncrement;
		const modifier = modifierIncrement[modifierKey] || 1;
		const newValue = ((parseFloat(value) - modifier) * 100) / 100;
		setValue(newValue);
	};
	const handleIncrement = () => {
		// Get the most recent key presses
		// if valid modifier / modifier combination, get the modifier
		// increment value
		//console.log("Tryna increment");
		const modifierKey = key_press.current.join("") as keyof typeof modifierIncrement;
		const modifier = modifierIncrement[modifierKey] || 1;
		const newValue = ((parseFloat(value) + modifier) * 100) / 100;
		setValue(newValue);
	};
	// Add event listeners for key press to capture
	useEffect(() => {
		document.addEventListener("keydown", (e: KeyboardEvent) => {
			if (!key_press.current.includes(e.key)) {
				key_press.current = [e.key, key_press.current[0]];
			}
		});
		document.addEventListener("keyup", (e: KeyboardEvent) => {
			key_press.current = key_press.current.filter((key) => key !== e.key);
		});

		return () => {
			document.removeEventListener("keydown", (e: KeyboardEvent) => {
				if (!key_press.current.includes(e.key)) {
					key_press.current = [e.key, key_press.current[0]];
				}
			});
			document.removeEventListener("keyup", (e: KeyboardEvent) => {
				key_press.current = key_press.current.filter((key) => key !== e.key);
			});
		};
	}, []);

	return (
		<div className="group/single flex flex-row w-16 h-8 bg-tertiary p-2 space-x-0 rounded-xl items-center justify-evenly">
			<div className="w-full h-full justify-center items-center flex flew-row flex-nowrap">
				<div
					className="z-10 cursor-pointer select-none scale-0 translate-x-10 group-hover:scale-100 group-hover:translate-x-0 expand-element-group-100 origin-right"
					onClick={handleDecrement}></div>
				<div
					className=" w-fit min-w-4 max-w-12 flex-shrink flex justify-center items-center text-center z-0"
					title={parseFloat(value).toFixed(2)}>
					<p className="m-0 p-0 inset-0 text-center justify-center font-Inter hover:">
						{parseFloat(value).toFixed(2)}
					</p>
				</div>

				<div
					className="z-10 cursor-pointer select-none scale-0 -translate-x-10 group-hover:scale-100 group-hover:translate-x-0 expand-element-group-100 origin-right"
					onClick={handleIncrement}></div>
			</div>
			<div className="absolute select-none pointer-events-none bg-highlight -translate-y-full aspect-square h-auto px-1 rounded-lg group-hover/single:scale-100 scale-0 expand-element-group-100 origin-top ">
				{name}
			</div>
		</div>
	);
};

export default InputSingle;

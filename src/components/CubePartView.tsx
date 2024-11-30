import React, { useEffect, useContext, useRef } from "react";
import SideBarWidget from "./templates/SideBarWidget";
import Icon from "../assets/icons/solid/.all";
import { modifiers, modifierIncrement } from "../constants/KeyModifiers";

const InputSingle = ({ name, value }: { name: string; value: string }) => {
	const [valueRef, setValueRef] = React.useState(value);
	//store two most recent key presses
	const key_press = useRef<string[]>(["", ""]);

	const handleDecrement = () => {
		// Get the most recent key presses
		// if valid modifier / modifier combination, get the modifier
		// decrement value
		const modifierKey = key_press.current.join("") as keyof typeof modifierIncrement;
		const modifier = modifierIncrement[modifierKey] || 1;
		const newValue = Math.round((parseFloat(valueRef) - modifier) * 100) / 100;
		setValueRef(newValue.toString());
	};
	const handleIncrement = () => {
		// Get the most recent key presses
		// if valid modifier / modifier combination, get the modifier
		// increment value
		const modifierKey = key_press.current.join("") as keyof typeof modifierIncrement;
		const modifier = modifierIncrement[modifierKey] || 1;
		const newValue = Math.round((parseFloat(valueRef) + modifier) * 100) / 100;
		setValueRef(newValue.toString());
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
					onClick={handleDecrement}>
					<Icon
						name="caret-left"
						height={24}
						width={24}
						colour="red"
						alt_text="decrement"
						center_x
					/>
				</div>
				<div
					className=" w-fit min-w-4 max-w-12 flex-shrink flex justify-center items-center text-center z-0"
					title={valueRef}>
					<p className="m-0 p-0 inset-0 text-center justify-center font-Inter hover:">
						{valueRef}
					</p>
				</div>

				<div
					className="z-10 cursor-pointer select-none scale-0 -translate-x-10 group-hover:scale-100 group-hover:translate-x-0 expand-element-group-100 origin-right"
					onClick={handleIncrement}>
					<Icon
						name="caret-right"
						height={24}
						width={24}
						colour="red"
						alt_text="increment"
						center_x
					/>
				</div>
			</div>
			<div className="absolute select-none pointer-events-none bg-highlight -translate-y-full aspect-square h-auto px-1 rounded-lg group-hover/single:scale-100 scale-0 expand-element-group-100 origin-top ">
				{name}
			</div>
		</div>
	);
};

const InputDouble = (props: { name: string; value: number[] }) => {
	return (
		<div className="flex flex-row space-x-2 bg-tertiary p-1 px-3 rounded-xl">X val</div>
	);
};

const InputTriple = ({
	name,
	value,
	children,
}: {
	name: string;
	value: number[];
	children?: React.ReactNode;
}) => {
	var append = "";
	if (name === "Rotate") {
		append = "°";
	}
	return (
		<React.Fragment>
			<div
				className="group flex flex-col flex-nowrap space-y-0.5 items-center justify-center"
				title={name}>
				<div className="flex flex-row flex-nowrap space-x-1 items-center justify-center">
					{children}
					<p className="text-xs text-gray-400 m-0 p-0">{name}</p>
				</div>
				<div className=" flex flex-row space-x-2 w-auto h-auto bg-secondary p-1 px-3 rounded-xl">
					<InputSingle name="X" value={value[0].toString() + append} />

					<InputSingle name="Y" value={value[1].toString() + append} />

					<InputSingle name="Z" value={value[2].toString() + append} />
				</div>
			</div>
		</React.Fragment>
	);
};

const CubePartView: React.FC = () => {
	return (
		<React.Fragment>
			<SideBarWidget name="Cube">
				<InputTriple name="Position" value={[100000, 11, 12]}>
					<Icon
						name="arrow-up-right"
						height={16}
						width={16}
						colour="red"
						alt_text="Position"
					/>
				</InputTriple>

				<InputTriple name="Size" value={[100000, 11, 12]}>
					<Icon
						name="arrows-up-down-left-right"
						height={16}
						width={16}
						colour="red"
						alt_text="Size"
					/>
				</InputTriple>
				<InputTriple name="Pivot" value={[100000, 11, 12]}>
					<Icon
						name="arrows-to-dot"
						height={16}
						width={16}
						colour="red"
						alt_text="Pivot"
					/>
				</InputTriple>
				<InputTriple name="Rotate" value={[100000, 11, 12]}>
					<Icon
						name="arrows-rotate"
						height={16}
						width={16}
						colour="red"
						alt_text="rotate"
					/>
				</InputTriple>
			</SideBarWidget>
		</React.Fragment>
	);
};

export default CubePartView;

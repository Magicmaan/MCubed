import React, { useEffect, useContext, useRef, useState } from "react";
import SideBarWidget from "./templates/SideBarWidget";
import Icon from "../assets/icons/solid/.all";
import { modifiers, modifierIncrement } from "../constants/KeyModifiers";

import { useScroll } from "@react-three/drei";
import type { CubeProps, THREEObjectProps } from "../primitives/Cube";
import Cube from "../primitives/Cube";
import { it } from "node:test";
import { Canvas, useThree } from "@react-three/fiber";
import ContextMenu from "../components/ContextMenu.tsx";
import useContextMenu from "../hooks/useContextMenu.tsx";
import { NumberDisplaySingle, NumberDisplayVec3 } from "./templates/NumberDisplay.tsx";

import * as THREE from "three";
import { match } from "assert";
import { useMeshSelector, useViewportSelector } from "../hooks/useRedux";
import { text } from "stream/consumers";

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
					title={parseFloat(value).toFixed(2)}>
					<p className="m-0 p-0 inset-0 text-center justify-center font-Inter hover:">
						{parseFloat(value).toFixed(2)}
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

const InputTriple = ({
	name,
	cube,
	children,
	set,
}: {
	name: "Position" | "Size" | "Pivot" | "Rotate";
	cube: [CubeProps, React.Dispatch<React.SetStateAction<CubeProps>>];
	children?: React.ReactNode;
	set: (cube: CubeProps) => void;
}) => {
	let append = "";
	let data = [0, 0, 0];
	switch (name) {
		case "Position":
			data = cube[0].position;
			break;
		case "Size":
			data = cube[0].size;
			break;
		case "Pivot":
			data = cube[0].pivot;
			break;
		case "Rotate":
			data = cube[0].rotation;
			append = "°";
			break;
	}

	return (
		<div className="select-none">
			<div
				className="group flex flex-col flex-nowrap space-y-0.5 items-center justify-center select-none"
				title={name}>
				<div className="flex flex-row flex-nowrap space-x-1 items-center justify-center">
					{children}
					<p className="text-xs text-gray-400 m-0 p-0">{name}</p>
				</div>
				<div className=" flex flex-row space-x-2 w-auto h-auto bg-secondary p-1 px-3 rounded-xl">
					<InputSingle
						name="X"
						inputType={name}
						value={data[0].toString() + append}
						setValue={(val: number) =>
							set({ ...cube[0], pos: [val, cube[0].pos[1], cube[0].pos[2]] })
						}
					/>
					<InputSingle
						name="Y"
						inputType={name}
						value={data[1].toString() + append}
						setValue={(val: number) =>
							set({ ...cube[0], pos: [cube[0].pos[0], val, cube[0].pos[2]] })
						}
					/>
					<InputSingle
						name="Z"
						inputType={name}
						value={data[2].toString() + append}
						setValue={(val: number) =>
							set({ ...cube[0], pos: [cube[0].pos[0], cube[0].pos[1], val] })
						}
					/>
				</div>
			</div>
		</div>
	);
};

const CubePartView: React.FC = () => {
	//const data = React.useContext(modelContext);
	const meshStore = useMeshSelector();
	const viewportStore = useViewportSelector();
	const selected = useRef(viewportStore.selected);
	const [cube, setCube] = useState<CubeProps>();
	useEffect(() => {
		console.log("Selected: ", selected);
		selected.current = viewportStore.selected;
		if (selected) {
			setCube(meshStore.mesh[selected.current]);
		}
	}, [viewportStore.selected, meshStore.mesh]);

	return (
		<SideBarWidget name={cube?.name ?? ""}>
			{cube ? (
				<>
					<div className="bg-red-400 justify-center items-center flex flex-col p-1 w-auto">
						<div className="space-y-1 flex-col flex">
							<p>Position</p>
							<NumberDisplayVec3 vec={cube.position} />

							<div className="w-52 h-auto flex flex-row justify-between p-1 bg-red-500 rounded-md"></div>
						</div>
					</div>

					<div className="bg-red-400 justify-center items-center flex flex-col p-1 w-auto">
						<div className="space-y-1 flex-col flex">
							<p>Rotation</p>
							<NumberDisplayVec3
								vec={[
									(cube.rotation[0] * 180) / Math.PI,
									(cube.rotation[1] * 180) / Math.PI,
									(cube.rotation[2] * 180) / Math.PI,
								]}
							/>

							<div className="w-52 h-auto flex flex-row justify-between p-1 bg-red-500 rounded-md"></div>
						</div>
					</div>
					<div className="bg-red-400 justify-center items-center flex flex-col p-1 w-auto">
						<div className="space-y-1 flex-col flex">
							<p>Pivot</p>
							<NumberDisplayVec3
								vec={[
									(cube.rotation[0] * 180) / Math.PI,
									(cube.rotation[1] * 180) / Math.PI,
									(cube.rotation[2] * 180) / Math.PI,
								]}
							/>

							<div className="w-52 h-auto flex flex-row justify-between p-1 bg-red-500 rounded-md"></div>
						</div>
					</div>
				</>
			) : (
				// <React.Fragment>
				// 	{/* position */}
				// 	<InputTriple
				// 		name="Position"
				// 		cube={cube.current}
				// 		set={(cube: CubeProps) => {
				// 			data.set(
				// 				data.model.map((item) => {
				// 					if (item.id == cube.id) {
				// 						return cube;
				// 					} else {
				// 						return item;
				// 					}
				// 				})
				// 			);
				// 		}}>
				// 		<Icon
				// 			name="arrow-up-right"
				// 			height={16}
				// 			width={16}
				// 			colour="red"
				// 			alt_text="Position"
				// 		/>
				// 	</InputTriple>
				// 	{/* size */}
				// 	<InputTriple
				// 		name="Size"
				// 		cube={cube}
				// 		set={(cube: CubeProps) => {
				// 			data.set(
				// 				data.model.map((item) => {
				// 					if (item.id == cube.id) {
				// 						return cube;
				// 					} else {
				// 						return item;
				// 					}
				// 				})
				// 			);
				// 		}}>
				// 		<Icon
				// 			name="arrows-up-down-left-right"
				// 			height={16}
				// 			width={16}
				// 			colour="red"
				// 			alt_text="Size"
				// 		/>
				// 	</InputTriple>
				// 	{/* pivot */}
				// 	<InputTriple
				// 		name="Pivot"
				// 		cube={cube}
				// 		set={(cube: CubeProps) => {
				// 			data.set(
				// 				data.model.map((item) => {
				// 					if (item.id == cube.id) {
				// 						return cube;
				// 					} else {
				// 						return item;
				// 					}
				// 				})
				// 			);
				// 		}}>
				// 		<Icon
				// 			name="arrows-to-dot"
				// 			height={16}
				// 			width={16}
				// 			colour="red"
				// 			alt_text="Pivot"
				// 		/>
				// 	</InputTriple>
				// 	{/* rotate */}
				// 	<InputTriple
				// 		name="Rotate"
				// 		cube={cube}
				// 		set={(cube: CubeProps) => {
				// 			data.set(
				// 				data.model.map((item) => {
				// 					if (item.id == cube.id) {
				// 						return cube;
				// 					} else {
				// 						return item;
				// 					}
				// 				})
				// 			);
				// 		}}>
				// 		<Icon
				// 			name="arrows-rotate"
				// 			height={16}
				// 			width={16}
				// 			colour="red"
				// 			alt_text="rotate"
				// 		/>
				// 	</InputTriple>{" "}
				// </React.Fragment>
				<div>nuh uh</div>
			)}
		</SideBarWidget>
	);
};

export default CubePartView;

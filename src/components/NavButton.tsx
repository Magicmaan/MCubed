import { useState, useEffect } from "react";
import * as React from "react";
import * as Icons from "../assets/icons.tsx";
import Icon from "../assets/icons/solid/.all.tsx";

const NavButton: React.FC<{
	text: string;
	children?: React.ReactNode;
	hasOpened: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
	currentButton: [string, React.Dispatch<React.SetStateAction<string>>];
}> = (props) => {
	const [isOpen, setOpen] = useState(false);
	let timeoutId: ReturnType<typeof setTimeout>;

	const handleOpen = () => {
		clearTimeout(timeoutId);
		props.currentButton[1](props.text);

		props.hasOpened[1](true);
	};

	const handleClose = () => {
		timeoutId = setTimeout(() => {
			if (props.currentButton[0] === props.text) {
				props.hasOpened[1](false);
				document.getElementById(props.text)?.dataset;
				props.currentButton[1]("");
			}
		}, 1000);
	};

	useEffect(() => {
		if (props.currentButton[0] !== props.text) {
			setOpen(false);
		} else {
			setOpen(true);
		}
	}, [props.currentButton]);

	return (
		<React.Fragment>
			<button
				className=" bg-button border-1 border-button-border hover:bg-button-hover rounded-md text-white font-bold py-1 px-1 h-full"
				id={props.text}
				//onTouchMove={() => console.log("touchmove")}
				onClick={handleOpen}
				onMouseEnter={() => {
					if (props.hasOpened[0]) {
						handleOpen();
					}
				}}>
				<h2 className="text-lg text-white font-Inter">{props.text}</h2>
			</button>
			{
				<div
					aria-expanded={isOpen}
					id="navDropdown"
					className="absolute h-auto min-w-48 bg-blue-500 text-white font-bold pt-3 pb-5 px-0.5 expand-element-group-500 rounded-xl"
					style={{
						left: document.getElementById(props.text)?.offsetLeft,
						top: document.getElementById("navContainer")?.offsetHeight,
					}}
					onMouseLeave={handleClose}
					onMouseEnter={() => clearTimeout(timeoutId)}>
					<div
						aria-expanded={isOpen}
						className="h-auto w-auto items-start justify-start bg-amber-800 px-1 expand-element-group-200 flex flex-nowrap flex-col">
						{props.children}
						<div className="h-0.5 w-full flex bg-red-500 mt-2 rounded-lg -scale-x-90" />
					</div>
				</div>
			}
		</React.Fragment>
	);
};

const NavChildItem: React.FC<{ text: string }> = ({ text }) => (
	<div className="w-full h-full bg-amber-400 justify-center items-center rounded-sm p-0.5 pl-2 py-0">
		<div className="bg-transparent w-full flex text-white font-bold py-1 m-0 justify-start items-center">
			<h2 className="text-base text-white font-Inter">{text}</h2>
		</div>
	</div>
);

const NavChildCheck: React.FC<{
	text: string;
	children?: React.ReactNode;
	value: boolean | undefined;
	set: () => void;
}> = ({ text, value, set }) => (
	<div className="w-full h-auto flex flex-row flex-nowrap bg-amber-400 justify-between items-start rounded-sm p-0.5 pl-2">
		<div className="bg-transparent w-auto flex text-white font-bold py-1 m-0 justify-start items-center">
			<h2 className="text-base text-white font-Inter">{text}</h2>
		</div>
		<div className="w-auto h-full justify-center items-center p-1">
			<div
				onClick={() => {
					set();
					console.log("Nav check click");
				}}
				className="bg-red-500 h-6 w-6 flex aspect-square rounded-md border-blue-500 border-2 justify-center items-center">
				{value ? (
					<Icon name="check" colour="white" width={16} height={16} />
				) : (
					<Icon name="xmark" colour="white" width={16} height={16} />
				)}
			</div>
		</div>
	</div>
);
const NavChildButton: React.FC<{ text: string; children?: React.ReactNode }> = ({
	text,
	children,
}) => (
	<div className="group/navChild w-full h-auto items-stretch bg-amber-400 rounded-lg">
		<div className="w-auto min-w-48 h-auto bg-gray-500 translate-x-full right-0 absolute pb-5 px-1 pt-1 transition transform origin-top-left duration-200 ease-in-out scale-x-0 scale-y-50 group-hover/navChild:scale-x-100 group-hover/navChild:scale-y-100 rounded-lg">
			<div className="h-auto w-auto items-start justify-start px-1 transition transform ease-in duration-200 origin-top scale-y-0 group-hover:scale-y-100 flex flex-nowrap flex-col">
				{children}
				<div className="h-0.5 w-full flex bg-red-500 mt-2 rounded-lg -scale-x-90" />
			</div>
		</div>
		<button className="bg-red-500 w-full flex text-white font-bold py-1 m-0 items-stretch rounded-lg">
			<h2 className="text-base text-white font-Inter">{text}</h2>
			<div className="flex-grow flex bg-white" />
			<div className="bg-green-500 h-auto w-auto flex justify-center items-center">
				<Icons.IconCaretRight />
			</div>
		</button>
	</div>
);
export { NavButton, NavChildItem, NavChildButton, NavChildCheck };

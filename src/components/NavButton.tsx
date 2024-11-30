import { useState, useEffect } from "react";
import * as React from "react";
import * as Icons from "../assets/icons.tsx";

const NavButton = (props: {
	text: string;
	children?: React.ReactNode;
	hasOpened: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
	currentButton: [string, React.Dispatch<React.SetStateAction<string>>];
}) => {
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
				onTouchMove={() => console.log("touchmove")}
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
					data-open
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

const NavChildItem = (props: { text: string }) => (
	<div className="w-full h-auto items-stretch bg-amber-400">
		<div className="bg-red-500 w-full flex text-white font-bold py-1 m-0">
			<h2 className="text-base text-white font-Inter">{props.text}</h2>
		</div>
	</div>
);

const NavChildButton = (props: { text: string; children?: React.ReactNode }) => (
	<div className="group/navChild w-full h-auto items-stretch bg-amber-400 rounded-lg">
		<div className="w-auto min-w-48 h-auto bg-gray-500 translate-x-full right-0 absolute pb-5 px-1 pt-1 transition transform origin-top-left duration-200 ease-in-out scale-x-0 scale-y-50 group-hover/navChild:scale-x-100 group-hover/navChild:scale-y-100 rounded-lg">
			<div className="h-auto w-auto items-start justify-start px-1 transition transform ease-in duration-200 origin-top scale-y-0 group-hover:scale-y-100 flex flex-nowrap flex-col">
				{props.children}
				<div className="h-0.5 w-full flex bg-red-500 mt-2 rounded-lg -scale-x-90" />
			</div>
		</div>
		<button className="bg-red-500 w-full flex text-white font-bold py-1 m-0 items-stretch rounded-lg">
			<h2 className="text-base text-white font-Inter">{props.text}</h2>
			<div className="flex-grow flex bg-white" />
			<div className="bg-green-500 h-auto w-auto flex justify-center items-center">
				<Icons.IconCaretRight />
			</div>
		</button>
	</div>
);
export { NavButton, NavChildItem, NavChildButton };

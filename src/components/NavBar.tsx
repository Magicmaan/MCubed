import { useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import "../App.css";
import * as React from "react";

function NavBar() {
	const [visible, setVisible] = useState(true);

	const NavButton = (props: { text: string }) => {
		return (
			<button className="navButton">
				<h2 className="text-xl text-white font-Inter">{props.text}</h2>
			</button>
		);
	};

	return (
		<>
			<div
				id="navContainer"
				className="flex flex-row  w-auto h-auto min-h-8 bg-green-500 flex-nowrap items-center justify-between overflow-y-hidden pb-1">
				<div
					id="buttonContainer"
					className="flex flex-row w-1/3  h-auto min-h-1 bg-red-500 flex-nowrap items-center justify-start">
					<NavButton text="File" />
					<NavButton text="Edit" />
					<NavButton text="View" />
					<NavButton text="Help" />
				</div>

				<div
					id="viewButtonContainer"
					className="flex flex-row w-1/3  h-auto min-h-1 flex-nowrap bg-green-400 justify-center">
					<NavButton text="Model" />
					<NavButton text="Texture" />
					<NavButton text="Render" />
				</div>

				<div id="spacer" className="w-1/3 min-h-1 bg-blue-500 justify-center"></div>
			</div>
		</>
	);
}

export default NavBar;

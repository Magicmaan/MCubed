import { useState, useEffect } from "react";
import * as React from "react";
import { NavButton, NavChildButton, NavChildItem } from "./NavButton";
import "../App.css";

function NavBar() {
	const hasOpened = useState(false);
	const currentButton = useState("");

	useEffect(() => {
		const element = document.getElementById("navContainer");
		if (element) {
			const navHeight = element.clientHeight;
		}
	}, []);

	return (
		<div
			id="navContainer"
			className="flex flex-row w-auto h-auto min-h-8 bg-green-500 flex-nowrap items-center justify-between overflow-y-hidden pb-1">
			<div
				id="buttonContainer"
				className="group flex flex-row w-1/3 h-auto min-h-1 bg-red-500 flex-nowrap items-center justify-start">
				<NavButton text="File" hasOpened={hasOpened} currentButton={currentButton}>
					<NavChildButton text="New">
						<NavChildButton text="Project">
							<NavChildItem text="File" />
							<NavChildItem text="File" />
						</NavChildButton>
						<NavChildItem text="File" />
						<NavChildItem text="File" />
						<NavChildItem text="File" />
						<NavChildItem text="File" />
					</NavChildButton>
					<NavChildItem text="Open" />
				</NavButton>
				<NavButton text="Edit" hasOpened={hasOpened} currentButton={currentButton}>
					<NavChildButton text="New">
						<NavChildButton text="Project">
							<NavChildItem text="File" />
							<NavChildItem text="File" />
						</NavChildButton>
						<NavChildItem text="File" />
						<NavChildItem text="File" />
						<NavChildItem text="File" />
						<NavChildItem text="File" />
					</NavChildButton>
					<NavChildItem text="Open" />
				</NavButton>
				<NavButton text="View" hasOpened={hasOpened} currentButton={currentButton} />
				<NavButton text="Help" hasOpened={hasOpened} currentButton={currentButton} />
			</div>
			<div
				id="viewButtonContainer"
				className="flex flex-row w-1/3 h-auto min-h-1 flex-nowrap bg-green-400 justify-center">
				<NavButton text="Model" hasOpened={hasOpened} currentButton={currentButton} />
				<NavButton text="Texture" hasOpened={hasOpened} currentButton={currentButton} />
				<NavButton text="Render" hasOpened={hasOpened} currentButton={currentButton} />
			</div>
			<div id="spacer" className="w-1/3 min-h-1 bg-blue-500 justify-center"></div>
		</div>
	);
}

export default NavBar;

import { useState } from "react";
import * as React from "react";
import { NavButton, NavChildButton, NavChildItem } from "./NavButton";
import "../styles/App.css";

const NavBar: React.FC = () => {
	const hasOpened = useState(false);
	const currentButton = useState("");

	return (
		<div
			id="navContainer"
			className="flex flex-row w-auto h-auto min-h-8 bg-main border-secondary border-b-4 flex-nowrap items-center justify-between overflow-y-hidden pb-0.5">
			<div
				id="buttonContainer"
				className="group flex flex-row w-1/3 h-auto min-h-1  flex-nowrap items-center justify-start  space-x-0.5">
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
				className="flex flex-row w-1/3 h-auto min-h-1 flex-nowrap  justify-center">
				<NavButton text="Model" hasOpened={hasOpened} currentButton={currentButton} />
				<NavButton text="Texture" hasOpened={hasOpened} currentButton={currentButton} />
				<NavButton text="Render" hasOpened={hasOpened} currentButton={currentButton} />
			</div>
			<div
				id="settingButtonContainer"
				className="flex flex-row w-1/3 h-auto min-h-1 flex-nowrap  justify-center"></div>
		</div>
	);
};

export default NavBar;

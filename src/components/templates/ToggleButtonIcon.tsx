import React, { useState, useRef } from "react";
import Icon from "./Icon"; // Adjust the import according to your project structure

interface ToggleButtonIconProps {
	Icon_on?: React.ReactNode;
	Icon_off?: React.ReactNode;
	Icon?: React.ReactNode;
	onClick: () => void;
	isActive: boolean;
}

const ToggleButtonIcon: React.FC<ToggleButtonIconProps> = ({
	Icon,
	Icon_on,
	Icon_off,
	onClick,
	isActive,
}) => {
	const [refresh, setRefresh] = useState(0);
	const snapPivotToggle = useRef(isActive);

	return (
		<div
			className="bg-secondary p-1 rounded-md w-min h-min justify-center items-center cursor-pointer aspect-square"
			onClick={() => {
				snapPivotToggle.current = !snapPivotToggle.current;
				setRefresh((prev) => prev + 1);
				onClick();
			}}>
			{Icon}
			{snapPivotToggle.current ? Icon_on : Icon_off}
		</div>
	);
};

export default ToggleButtonIcon;

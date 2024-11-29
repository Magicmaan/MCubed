import React from "react";
import "../App.css";

const cubeColours = {
	red: "#EF4444",
	green: "#10B981",
	blue: "#3B82F6",
	yellow: "#F59E0B",
	cyan: "#06B6D4",
	magenta: "#EC4899",
	orange: "#F97316",
	purple: "#8B5CF6",
	pink: "#F9A8D4",
	brown: "#78350F",
};
/**
 * Returns a random color from the cubeColours object.
 *
 * @returns {string} A random color value from the cubeColours object.
 */
const randomCubeColour = () => {
	const keys = Object.keys(cubeColours);
	return cubeColours[keys[Math.floor(Math.random() * keys.length)]];
};

export { cubeColours, randomCubeColour };

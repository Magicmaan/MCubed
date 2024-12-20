import React from "react";
import "../styles/App.css";

const cubeColours = {
	red: "#EF4444",
	blue: "#3B82F6",
	green: "#10B981",
	yellow: "#F59E0B",
	purple: "#8B5CF6",
	orange: "#F97316",
	pink: "#EC4899",
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

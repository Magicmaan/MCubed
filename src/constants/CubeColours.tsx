import React from "react";
import "../styles/App.css";

const cubeColours = {
	red: "#EF4444",
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

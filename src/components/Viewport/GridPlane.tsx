import React from "react";
import { Canvas } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { DoubleSide } from "three";

interface GridPlaneProps {
	size: number;
	lineWidth: number;
	density?: number;
	color?: string;
}

const GridPlane: React.FC<GridPlaneProps> = ({
	size,
	lineWidth,
	density = 1,
	color = "red",
}) => {
	return (
		<Grid
			args={[size, size]}
			lineWidth={lineWidth}
			cellSize={size / density}
			side={DoubleSide}
			color={color}
		/>
	);
};

export default GridPlane;

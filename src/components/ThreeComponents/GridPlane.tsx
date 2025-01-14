import React from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, useTexture, Text } from "@react-three/drei";
import { DoubleSide } from "three";
import { loadTexture } from "../../util/textureUtil";
import * as THREE from "three";
import { useViewportSelector } from "../../hooks/useRedux";

interface GridPlaneProps {
	size: number;
	lineWidth?: number;
	density?: number;
	color?: string;
}

const GridPlane: React.FC<GridPlaneProps> = ({ size }) => {
	const showGrid = useViewportSelector().showGrid;

	const outlineTexture = React.useMemo(() => loadTexture("/src/assets/grid.png"), []);
	const xMarkerTexture = React.useMemo(() => loadTexture("/src/assets/x_marker.png"), []);
	const zMarkerTexture = React.useMemo(() => loadTexture("/src/assets/z_marker.png"), []);

	return (
		<group visible={showGrid}>
			<Grid
				args={[size, size]}
				cellSize={size}
				side={DoubleSide}
				cellThickness={0}
				sectionThickness={2}
				sectionColor={"#888888"}
			/>

			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} visible={true}>
				<planeGeometry args={[size + 2, size + 2]} />
				<meshBasicMaterial map={outlineTexture} transparent side={THREE.DoubleSide} />
			</mesh>

			<mesh
				rotation={[-Math.PI / 2, 0, Math.PI / 2]}
				position={[12, -0.01, 0]}
				scale={[0.5, 0.5, 0.5]}
				visible={true}>
				<planeGeometry args={[5, 7]} />
				<meshBasicMaterial map={xMarkerTexture} transparent side={THREE.DoubleSide} />
			</mesh>
			<mesh
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, -0.01, 12]}
				scale={[0.5, 0.5, 0.5]}
				visible={true}>
				<planeGeometry args={[5, 7]} />
				<meshBasicMaterial map={zMarkerTexture} transparent side={THREE.DoubleSide} />
			</mesh>
		</group>
	);
};

export default GridPlane;

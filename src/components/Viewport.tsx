import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";
import { BoxGeometry } from "three";
import * as React from "react";
import { Canvas, useFrame, useThree, getRootState } from "@react-three/fiber";
import { useEffect } from "react";
import {
	OrbitControls,
	Hud,
	PerspectiveCamera,
	Grid,
	Outlines,
	Html,
	PivotControls,
} from "@react-three/drei";
import { modelContext, useModelContext } from "../context/ModelContext";
import { CubeProps } from "../primitives/Cube";
import { useViewportContext } from "../context/ViewportContext";
import { Stats } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { color } from "three/webgpu";
import Icon from "../assets/icons/solid/.all";
import icon from "../assets/arrow.png";

// https://drei.docs.pmnd.rs/gizmos/pivot-controls
// https://github.com/pmndrs/drei/blob/master/src/web/pivotControls/index.tsx

function CubeMesh(cube: CubeProps, isSelected: boolean) {
	return (
		<PivotControls anchor={[0, 0, 0]} scale={2} rotation={[0, 0, 0]} renderOrder={1}>
			<mesh
				key={cube.id}
				position={cube.pos}
				rotation={cube.rot}
				scale={cube.scale}
				userData={{ id: cube.id, name: cube.name, color: cube.colour }}
				onClick={(e) => {
					const { id, name, color } = e.object.userData;
					console.log(`Clicked ${name} with id ${id} and color ${color}`);
				}}>
				<boxGeometry args={cube.size} />
				<meshStandardMaterial color={isSelected ? "white" : cube.colour} />
			</mesh>
		</PivotControls>
	);
}

// Let's make the marker into a component so that we can abstract some shared logic
function Marker({ children, ...props }) {
	const ref = React.useRef();
	// This holds the local occluded state
	const [isOccluded, setOccluded] = useState();
	const [isInRange, setInRange] = useState();
	const isVisible = isInRange && !isOccluded;
	// Test distance
	const vec = new THREE.Vector3();
	useFrame((state) => {
		const range =
			state.camera.position.distanceTo(ref.current.getWorldPosition(vec)) <= 10;
		if (range !== isInRange) setInRange(range);
		console.log(ref.current.getWorldPosition(vec));
	});
	return (
		<group ref={ref}>
			<Html
				position={[0, 0, 0]}
				// 3D-transform contents
				transform
				// Hide contents "behind" other meshes
				occlude
				// Tells us when contents are occluded (or not)
				onOcclude={setOccluded}
				// We just interpolate the visible state into css opacity and transforms
				style={{
					transition: "all 0.2s",
					opacity: 1,
				}}
				{...props}>
				{children}
			</Html>
		</group>
	);
}

function unpackModel(model: CubeProps[], selected: Number[]) {
	let unpackedModel: React.ReactNode[] = [];
	model.forEach((item: CubeProps) => {
		var isSelected = selected.includes(item.id);
		unpackedModel.push(CubeMesh(item, isSelected));
	});
	return unpackedModel;
}

const Viewport: React.FC = () => {
	const { model, selected, setSelected } = useModelContext();
	const [modelData, setModelData] = React.useState<React.ReactNode[]>([]);
	const settings = useViewportContext();
	const cameraRef = React.createRef();

	// Unpack the model data and bind it to the model
	React.useMemo(() => {
		setModelData(unpackModel(model, selected));
	}, [model, selected]);

	return (
		<Canvas
			id="viewport"
			className="w-full h-full pattern-1 "
			camera={{
				fov: settings.camera.fov,
				position: settings.camera.pos,
				manual: true,
			}}>
			<PerspectiveCamera
				makeDefault
				position={settings.camera.pos}
				fov={settings.camera.fov}
			/>
			<ambientLight intensity={Math.PI / 2} />
			<spotLight
				position={[10, 10, 10]}
				angle={0.15}
				penumbra={1}
				decay={0}
				intensity={Math.PI}
			/>
			<pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

			{modelData}
			<Grid
				cellSize={1}
				cellThickness={1}
				cellColor={"#FF0000"}
				sectionSize={2}
				sectionThickness={2}
			/>
			<OrbitControls />
			<Stats />
		</Canvas>
	);
};

export default Viewport;

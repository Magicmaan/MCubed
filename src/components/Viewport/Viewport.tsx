import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import * as THREE from "three";
import { BoxGeometry } from "three";
import * as React from "react";
import { Canvas, useFrame, useThree, getRootState, RootState } from "@react-three/fiber";
import { useEffect } from "react";
import {
	OrbitControls,
	Hud,
	PerspectiveCamera,
	Grid,
	Outlines,
	Html,
} from "@react-three/drei";
import { modelContext, useModelContext } from "./ModelContext";
import { CubeProps } from "../../primitives/Cube";
import { useViewportContext } from "./ViewportContext";
import { Stats } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { color } from "three/webgpu";
import Icon from "../../assets/icons/solid/.all";
import icon from "../assets/arrow.png";
import { PivotControls } from "../custom_PivotControl";
import { createTexture } from "../../util/textureUtil";
import GridPlane from "./GridPlane";

// TODO
// create custom camera component
// - implement camera controls
// - add context to control camera

// Simplify PivotControls
// - remove unnecessary code
// - make it more readable
// - implement interaction with outside components

function CubeMesh(
	cube: CubeProps,
	isSelected: boolean,
	setSelected: React.Dispatch<React.SetStateAction<[number]>>,
	useGimbal: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
) {
	if (isSelected) {
		console.log("Selected from VPort");
	}

	return (
		<PivotControls
			onDragStart={(e) => {
				useGimbal[1](false);
			}}
			onDragEnd={() => {
				useGimbal[1](true);
			}}
			anchor={[0, 0, 0]}
			scale={2}
			rotation={[0, 0, 0]}
			depthTest={false}
			enabled={isSelected}>
			<mesh
				type="mesh_cube"
				name={cube.name}
				key={cube.id}
				position={cube.pos}
				rotation={cube.rot}
				scale={cube.scale}
				userData={{ id: cube.id, name: cube.name, color: cube.colour }}
				onClick={(e) => {
					const { id, name, color } = e.object.userData;
					console.log(`Clicked ${name} with id ${id} and color ${color}`);

					setSelected([parseInt(id)]);
				}}>
				<boxGeometry args={cube.size} attach="geometry" />

				<meshStandardMaterial
					attach="material"
					map={createTexture(16, 16, cube.colour)}
					color={cube.colour}
					transparent={true}
					alphaTest={0.5} // Use alpha of the texture
					side={THREE.DoubleSide} // Render texture on both sides
					shadowSide={THREE.DoubleSide}
					toneMapped={false} // Render texture at full brightness
				/>
			</mesh>
		</PivotControls>
	);
}

function unpackModel(
	model: CubeProps[],
	selected: Number[],
	setSelected: React.Dispatch<React.SetStateAction<[number]>>,
	useGimbal: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
) {
	let unpackedModel: React.ReactNode[] = [];
	model.forEach((item: CubeProps) => {
		var isSelected = selected.includes(item.id);
		unpackedModel.push(CubeMesh(item, isSelected, setSelected, useGimbal));
	});
	return unpackedModel;
}

const GetSceneRef: React.FC<{
	setRef: React.Dispatch<
		React.SetStateAction<React.MutableRefObject<THREE.Scene | null>>
	>;
	setThree: React.Dispatch<React.SetStateAction<RootState | undefined>>;
}> = ({ setRef, setThree }) => {
	const { scene, camera } = useThree();
	const threeScene = useThree();
	setRef(scene);
	setThree(threeScene);

	return null;
};

const Viewport: React.FC = () => {
	const { model, selected, setSelected, sceneRef, setSceneRef } = useModelContext();
	const { camera, lookAt, background, cameraLock } = useViewportContext();
	const [modelData, setModelData] = React.useState<React.ReactNode[]>([]);
	const settings = useViewportContext();
	const [threeScene, setThreeScene] = useState<RootState>();
	const useGimbal = useState(true);

	// Unpack the model data and bind it to the model
	React.useMemo(() => {
		console.log("Camera lock: ", cameraLock);
		setModelData(unpackModel(model, selected, setSelected, useGimbal));
	}, [model, selected, threeScene]);

	const handleSelection = React.useCallback(() => {
		//TODO
	}, [selected]);
	useEffect(() => {
		handleSelection();
	}, [handleSelection]);

	return (
		<Canvas
			id="viewport"
			className="w-full h-full pattern-1 "
			camera={{
				fov: settings.camera.fov,
				position: settings.camera.pos,
				manual: true,
			}}>
			<GetSceneRef setRef={setSceneRef} setThree={setThreeScene} />
			<PerspectiveCamera
				makeDefault
				position={settings.camera.pos}
				fov={settings.camera.fov}
			/>

			<ambientLight intensity={0.5} />
			{modelData}
			<GridPlane size={32} />
			<OrbitControls
				enableZoom={useGimbal[0]}
				enablePan={useGimbal[0]}
				enableRotate={useGimbal[0]}
			/>
			<Stats />
		</Canvas>
	);
};

export default Viewport;

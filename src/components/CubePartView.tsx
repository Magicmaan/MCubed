import React, { useEffect, useContext, useRef, useState } from "react";
import SideBarWidget from "./templates/SideBarWidget";
import Icon from "../assets/icons/solid/.all";
import { modifiers, moveModifierIncrement } from "../constants/KeyModifiers";

import { useScroll } from "@react-three/drei";
import type { CubeProps, THREEObjectProps } from "../primitives/Cube";
import Cube from "../primitives/Cube";
import { it } from "node:test";
import { Canvas, invalidate, useThree } from "@react-three/fiber";
import ContextMenu from "../components/ContextMenu.tsx";
import useContextMenu from "../hooks/useContextMenu.tsx";
import { NumberDisplayVec3 } from "./templates/NumberDisplay.tsx";

import * as THREE from "three";
import { match } from "assert";
import {
	useAppDispatch,
	useMeshDataSelector,
	useMeshStoreSelector,
	useViewportSelector,
} from "../hooks/useRedux";
import { text } from "stream/consumers";
import { meshModifyIndex } from "../reducers/meshReducer.tsx";

const CubePartView: React.FC = () => {
	//const data = React.useContext(modelContext);
	const meshStore = useMeshStoreSelector();
	const meshData = useMeshDataSelector();
	const viewportStore = useViewportSelector();
	const dispatch = useAppDispatch();
	const selected = useRef(viewportStore.selected ?? -1);
	const [cube, setCube] = useState<CubeProps>();
	useEffect(() => {
		console.log("Selected: ", viewportStore.selected);
		selected.current = viewportStore.selected ?? -1;
		if (selected.current !== -1) {
			setCube(meshData[selected.current]);
		}
	}, [viewportStore.selected, meshData]);

	return (
		<SideBarWidget name={cube?.name ?? ""}>
			{cube ? (
				<>
					<div className="bg-red-400 justify-center items-center flex flex-col p-1 w-auto">
						<div className="space-y-1 flex-col flex">
							<p>Position</p>
							<NumberDisplayVec3
								vec={cube.position}
								setVec={(x: number, y: number, z: number) => {
									if (selected.current !== undefined) {
										console.log("Setting position for", selected.current, "to", [
											x,
											y,
											z,
										]);
										dispatch(meshModifyIndex({ index: cube.id, position: [x, y, z] }));
									}
									invalidate();
								}}
							/>

							<div className="w-52 h-auto flex flex-row justify-between p-1 bg-red-500 rounded-md"></div>
						</div>
					</div>

					<div className="bg-red-400 justify-center items-center flex flex-col p-1 w-auto">
						<div className="space-y-1 flex-col flex">
							<p>Rotation</p>
							<NumberDisplayVec3
								vec={[
									(cube.rotation[0] * 180) / Math.PI,
									(cube.rotation[1] * 180) / Math.PI,
									(cube.rotation[2] * 180) / Math.PI,
								]}
							/>

							<div className="w-52 h-auto flex flex-row justify-between p-1 bg-red-500 rounded-md"></div>
						</div>
					</div>
					<div className="bg-red-400 justify-center items-center flex flex-col p-1 w-auto">
						<div className="space-y-1 flex-col flex">
							<p>Pivot</p>
							<NumberDisplayVec3
								vec={[
									(cube.rotation[0] * 180) / Math.PI,
									(cube.rotation[1] * 180) / Math.PI,
									(cube.rotation[2] * 180) / Math.PI,
								]}
							/>

							<div className="w-52 h-auto flex flex-row justify-between p-1 bg-red-500 rounded-md"></div>
						</div>
					</div>
				</>
			) : (
				// <React.Fragment>
				// 	{/* position */}
				// 	<InputTriple
				// 		name="Position"
				// 		cube={cube.current}
				// 		set={(cube: CubeProps) => {
				// 			data.set(
				// 				data.model.map((item) => {
				// 					if (item.id == cube.id) {
				// 						return cube;
				// 					} else {
				// 						return item;
				// 					}
				// 				})
				// 			);
				// 		}}>
				// 		<Icon
				// 			name="arrow-up-right"
				// 			height={16}
				// 			width={16}
				// 			colour="red"
				// 			alt_text="Position"
				// 		/>
				// 	</InputTriple>
				// 	{/* size */}
				// 	<InputTriple
				// 		name="Size"
				// 		cube={cube}
				// 		set={(cube: CubeProps) => {
				// 			data.set(
				// 				data.model.map((item) => {
				// 					if (item.id == cube.id) {
				// 						return cube;
				// 					} else {
				// 						return item;
				// 					}
				// 				})
				// 			);
				// 		}}>
				// 		<Icon
				// 			name="arrows-up-down-left-right"
				// 			height={16}
				// 			width={16}
				// 			colour="red"
				// 			alt_text="Size"
				// 		/>
				// 	</InputTriple>
				// 	{/* pivot */}
				// 	<InputTriple
				// 		name="Pivot"
				// 		cube={cube}
				// 		set={(cube: CubeProps) => {
				// 			data.set(
				// 				data.model.map((item) => {
				// 					if (item.id == cube.id) {
				// 						return cube;
				// 					} else {
				// 						return item;
				// 					}
				// 				})
				// 			);
				// 		}}>
				// 		<Icon
				// 			name="arrows-to-dot"
				// 			height={16}
				// 			width={16}
				// 			colour="red"
				// 			alt_text="Pivot"
				// 		/>
				// 	</InputTriple>
				// 	{/* rotate */}
				// 	<InputTriple
				// 		name="Rotate"
				// 		cube={cube}
				// 		set={(cube: CubeProps) => {
				// 			data.set(
				// 				data.model.map((item) => {
				// 					if (item.id == cube.id) {
				// 						return cube;
				// 					} else {
				// 						return item;
				// 					}
				// 				})
				// 			);
				// 		}}>
				// 		<Icon
				// 			name="arrows-rotate"
				// 			height={16}
				// 			width={16}
				// 			colour="red"
				// 			alt_text="rotate"
				// 		/>
				// 	</InputTriple>{" "}
				// </React.Fragment>
				<div>nuh uh</div>
			)}
		</SideBarWidget>
	);
};

export default CubePartView;

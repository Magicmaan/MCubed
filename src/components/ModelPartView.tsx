import React, { useEffect, useMemo, useRef, useState } from "react";
import Cube from "../primitives/Cube"; // Make sure to import the Cube component

import "../styles/App.css";
import { randomCubeColour } from "../constants/CubeColours";
import { EditText, EditTextarea } from "react-edit-text";
import "react-edit-text/dist/index.css";
import Icon from "../assets/icons/solid/.all";
//import ContextMenu from "./ContextMenu";
//import useContextMenu from "../hooks/useContextMenu.tsx";
import { Menu, Item, Separator, Submenu, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import SideBarWidget from "./templates/SideBarWidget";
import { setServers } from "dns";
import meshSlice, { meshAddRandom, meshModify } from "../reducers/meshReducer";
import * as THREE from "three";
import {
	useAppDispatch,
	useAppSelector,
	useMeshDataSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from "../hooks/useRedux";
import { setSelected as reduxSetSelected } from "../reducers/viewportReducer";
import { invalidate } from "@react-three/fiber";

const ModelItem: React.FC<{
	item: any;
	selected?: number;
	setSelected: (id: number) => void;
}> = ({ item, selected: old, setSelected }) => {
	const dispatch = useAppDispatch();
	const selected = useState(useViewportSelector().selected);

	const MENU_ID = "context_model_part_" + item.id;
	const { show } = useContextMenu({
		id: MENU_ID,
	});
	function handleContextMenu(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
		document.getElementById("model_part_" + item.id)?.click();
		show({
			event,
			props: {
				key: "value",
			},
		});
	}
	const handleItemClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		if (item.id === selected[0]) {
			console.log("Item already selected");
			dispatch(reduxSetSelected(-1));
			selected[1](-1);
			invalidate();
		} else {
			dispatch(reduxSetSelected(parseInt(item.id)));
			selected[1](parseInt(item.id));
			invalidate();
		}

		event.preventDefault();
	};

	return (
		<button
			id={"model_part_" + item.id}
			aria-pressed={selected[0] === item.id}
			key={item.id}
			data-test={"hi"}
			onContextMenu={handleContextMenu}
			onClick={(e) => {
				handleItemClick(e);
			}}
			className="bg-secondary rounded-md w-full h-10 flex flex-nowrap flex-row justify-stretch items-center  aria-pressed:bg-button-hover focus:outline-none select-none">
			<Icon name="cube" height={16} width={16} colour="red" />

			<EditText name="cubeName" defaultValue={item.name} />

			<Menu id={MENU_ID} theme="contextTheme">
				<Item id={item.id} onClick={handleItemClick}>
					{item.id}
				</Item>
				<Item id="copy" onClick={handleItemClick}>
					Copy
				</Item>
				<Item id="cut" onClick={handleItemClick}>
					Cut
				</Item>
				<Separator />
				<Item disabled>Disabled</Item>
				<Separator />
				<Submenu label="Foobar">
					<Item id="reload" onClick={handleItemClick}>
						Reload
					</Item>
					<Item id="something" onClick={handleItemClick}>
						Do something else
					</Item>
				</Submenu>
			</Menu>
		</button>
	);
};

const ModelPartView: React.FC = () => {
	// const [partList, setPartList] = useState<Set<THREE.Mesh>>(new Set());
	const meshData = useMeshDataSelector();
	const selected = useViewportSelectedSelector();

	const dispatch = useAppDispatch();
	return (
		<SideBarWidget name="Model Part View">
			<button
				onClick={() => {
					console.log("added cube");
				}}>
				Update Model
			</button>

			<div className="flex flex-col flex-nowrap space-y-1 items-center justify-center w-full h-auto overflow-y-scroll">
				{meshData.map((item, index) => (
					<ModelItem
						item={item}
						key={index}
						selected={selected}
						setSelected={(id: number) => {
							dispatch(reduxSetSelected(id));
						}}
					/>
				))}
			</div>
		</SideBarWidget>
	);
};

export default ModelPartView;

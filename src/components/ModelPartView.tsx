import React, { useEffect, useMemo, useState } from "react";
import Cube from "../primitives/Cube"; // Make sure to import the Cube component
import { modelContext, ModelContextProvider } from "./Viewport/ModelContext";
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
import meshSlice, {
	meshAddRandom,
	meshModify,
	testReducer,
} from "../reducers/meshReducer";
import * as THREE from "three";
import {
	useAppDispatch,
	useAppSelector,
	useMeshSelector,
	useViewportSelector,
} from "../hooks/useRedux";

import { setSelected as reduxSetSelected } from "../reducers/viewportReducer";

const ModelItem: React.FC<{
	item: any;
	itemKey: number;
	selected?: number;
	setSelected: (id: number) => void;
}> = ({ item, itemKey, selected, setSelected }) => {
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
	const handleItemClick = ({ event }: { id: string; event: Event }) => {
		//console.log("item clicked", id);
		setSelected(parseInt(id));
	};

	return (
		<button
			id={"model_part_" + item.id}
			aria-pressed={selected === item.id}
			key={itemKey}
			data-test={"hi"}
			onContextMenu={handleContextMenu}
			onClick={() => {
				console.log(item.id);
				setSelected(parseInt(item.id));
			}}
			className="bg-secondary rounded-md w-full h-10 flex flex-nowrap flex-row justify-stretch items-center focus:bg-button-hover aria-pressed:bg-button-hover">
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
	const partList = useMeshSelector().mesh;
	const selected = useViewportSelector().selected;

	const MESH_WHITELIST = ["Mesh_Cube"];
	const dispatch = useAppDispatch();
	const setSelected = (id: number) => {
		dispatch(reduxSetSelected(id));
	};
	return (
		<React.Fragment>
			<SideBarWidget name="Model Part View">
				<button
					onClick={() => {
						console.log("added cube");
					}}>
					Update Model
				</button>

				<div className="flex flex-col flex-nowrap space-y-1 items-center justify-center w-full h-auto overflow-y-scroll">
					{partList.map((item, index) => (
						<ModelItem
							item={item}
							key={index}
							itemKey={index}
							selected={selected}
							setSelected={setSelected}
						/>
					))}
				</div>
			</SideBarWidget>
		</React.Fragment>
	);
};

export default ModelPartView;

import React, { useEffect, useMemo, useState } from "react";
import Cube from "../primitives/Cube"; // Make sure to import the Cube component
import { modelContext, ModelContextProvider } from "../context/ModelContext";
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
import * as THREE from "three";

const ModelItem: React.FC<{
	item: any;
	itemKey: number;
	selected: number[];
	setSelected: React.Dispatch<React.SetStateAction<Number[]>>;
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
		console.log("item clicked", id);
		setSelected([parseInt(id)]);
		console.log(id, event, props);
	};

	return (
		<button
			id={"model_part_" + item.id}
			aria-pressed={selected.includes(item.id)}
			key={itemKey}
			data-test={"hi"}
			onContextMenu={handleContextMenu}
			onClick={() => {
				console.log(item.id);
				setSelected([parseInt(item.id)]);
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
	const data = React.useContext(modelContext);
	const { model, set, selected, setSelected, sceneRef } = data;
	console.log("from model view ", data);

	return (
		<React.Fragment>
			<SideBarWidget name="Model Part View">
				<button
					onClick={() => {
						set([
							...model,
							Cube({
								colour: randomCubeColour(),
								pos: [Math.random() * 5, Math.random() * 5, Math.random() * 5],
								scale: 1,
							}),
						]);

						setSelected([model.length - 1]);

						console.log("from modelpartview ", data);

						if (sceneRef !== null) {
							sceneRef.traverse((child) => {
								if (child instanceof THREE.Mesh && child["type"] === "mesh_cube") {
									console.log("Mesh in Scene (will be 1 behind): ", child);
								}
							});
						}
					}}>
					Update Model
				</button>

				<div className="flex flex-col flex-nowrap space-y-1 items-center justify-center w-full h-auto overflow-y-scroll">
					{model
						? model.map((item) => (
								<ModelItem
									item={item}
									key={item.id}
									itemKey={item.id}
									selected={selected}
									setSelected={setSelected}
								/>
						  ))
						: null}
				</div>
			</SideBarWidget>
		</React.Fragment>
	);
};

export default ModelPartView;

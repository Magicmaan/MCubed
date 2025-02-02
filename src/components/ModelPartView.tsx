import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import '../styles/App.css';
import { randomCubeColour } from '../constants/CubeColours';
import { EditText, EditTextarea } from 'react-edit-text';
import 'react-edit-text/dist/index.css';
import Icon from '../assets/icons/solid/.all';
//import ContextMenu from "./ContextMenu";
//import useContextMenu from "../hooks/useContextMenu.tsx";
import {
	Menu,
	Item,
	Separator,
	Submenu,
	useContextMenu,
} from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import SideBarWidget from './templates/SideBarWidget';
import { setServers } from 'dns';
import meshSlice, {
	meshAddCube,
	meshAddRandom,
	meshModifyID,
	meshRemoveCube,
} from '../redux/reducers/meshReducer';
import * as THREE from 'three';
import {
	useAppDispatch,
	useAppSelector,
	useMeshDataSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from '../hooks/useRedux';
import { setSelected as reduxSetSelected } from '../redux/reducers/viewportReducer';
import { invalidate } from '@react-three/fiber';
import { eventNames } from 'process';
import { ContextInfoItem } from './templates/ContextMenu';
import { Button } from './ui/button';
import { CubeProps } from '../types/three';

const ModelItem: React.FC<{
	item: CubeProps;
	selected?: number;
	setSelected: (id: number) => void;
}> = ({ item, selected: old, setSelected }) => {
	const dispatch = useAppDispatch();
	const selected = useViewportSelectedSelector();
	const MENU_ID = 'context_model_part_' + item.id;
	const { show } = useContextMenu({
		id: MENU_ID,
	});
	const handleContextMenu = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		document.getElementById('model_part_' + item.id)?.click();
		show({
			event,
		});
		event.preventDefault();
		event.stopPropagation();
	};
	const handleItemClick = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		//dont click if right click or middle click
		if (event.button !== 0 || event.buttons !== 1) {
			return;
		}
		if (item.id === selected) {
			setSelected(-1);
			console.log('selected');
		} else {
			console.log('not selected');
			setSelected(item.id);
		}

		event.preventDefault();
	};

	return (
		<button
			id={'model_part_' + item.id}
			aria-pressed={selected === item.id}
			key={item.id}
			data-test={'hi'}
			onContextMenuCapture={handleContextMenu}
			onMouseDown={(e) => {
				handleItemClick(e);
			}}
			className="pointer-events-auto flex h-10 w-full select-none flex-row flex-nowrap items-center justify-stretch rounded-md bg-secondary hover:bg-button-hover focus:outline-none aria-pressed:bg-button-selected"
		>
			<Icon name="cube" height={16} width={16} colour="red" />

			<EditText name="cubeName" defaultValue={item.name} />

			<Menu id={MENU_ID} theme="contextTheme" className="bg-red-500">
				<ContextInfoItem
					label={item.name}
					title={`ID: ${item.id}`}
					icon="cube"
					textSize="text-sm"
				/>
				<Item id="copy" onClick={handleItemClick}>
					Copy
				</Item>
				<Item id="cut" onClick={handleItemClick}>
					Cut
				</Item>
				<Item
					id="delete"
					onClick={() => dispatch(meshRemoveCube({ id: item.id }))}
				>
					Delete
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
		<SideBarWidget
			name="Model Part View"
			className="flex h-96 flex-shrink flex-grow"
		>
			<div className="dark pointer-events-auto flex h-auto w-full flex-row items-center justify-between p-1 pb-2">
				<Button
					title="Add Cube"
					className="m-1 aspect-square h-8 w-8 items-center justify-center rounded-sm p-1 text-center dark:bg-main-500 dark:hover:bg-button-hover"
					variant={'default'}
					onClick={(e) => {
						dispatch(meshAddCube());
					}}
				>
					<p className="text-2xl leading-none">+</p>
				</Button>
			</div>

			<div className="h-full w-full flex-1 flex-col flex-nowrap items-center justify-center space-y-1 overflow-y-scroll">
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

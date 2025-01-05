import React, {
	useEffect,
	useContext,
	useRef,
	useState,
	useCallback,
} from 'react';
import SideBarWidget from './templates/SideBarWidget';
import Icon from '../assets/icons/solid/.all';
import { modifiers, moveModifierIncrement } from '../constants/KeyModifiers';

import { useScroll } from '@react-three/drei';
import type { CubeProps, THREEObjectProps } from './ThreeComponents/Cube.tsx';
import { it } from 'node:test';
import { Canvas, invalidate, useThree } from '@react-three/fiber';
import ContextMenu from '../components/ContextMenu.tsx';
import { useContextMenu, Separator } from 'react-contexify';
import {
	ContextItem,
	ContextInfoItem,
	ContextCopyPasteItem,
} from './templates/ContextMenu.tsx';
import { NumberDisplayVec3 } from './templates/NumberDisplay.tsx';

import * as THREE from 'three';
import { match } from 'assert';
import * as util from 'util';
import {
	useAppDispatch,
	useMeshDataSelector,
	useMeshStoreSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from '../hooks/useRedux';
import { text } from 'stream/consumers';
import { meshModifyIndex } from '../reducers/meshReducer.tsx';
import { Menu } from 'react-contexify';
import { getClipboardDataAsVector } from '../util/copyPasteUtil.tsx';
import { getClipboardData } from '../util/copyPasteUtil.tsx';
import { ErrorBoundary } from 'react-error-boundary';
import { addError } from '../reducers/appReducer.tsx';

const oldLog = console.log;
const newLog = function (value) {
	oldLog(value);
	return value;
};

const CubePartView: React.FC = () => {
	//const data = React.useContext(modelContext);
	const meshStore = useMeshStoreSelector();
	const meshData = useMeshDataSelector();
	const viewportStore = useViewportSelector();
	const dispatch = useAppDispatch();
	const selected = useViewportSelectedSelector() ?? -1;

	var cube = meshData[selected] as CubeProps;

	const positionSetVec = (x: number, y: number, z: number) => {
		if (selected !== -1) {
			console.log('Setting position for', selected, 'to', [x, y, z]);
			dispatch(meshModifyIndex({ index: cube.id, position: [x, y, z] }));
		}
	};
	const positionContextMenuID = 'cubePartView_position';
	const { show: showPositionContextMenu } = useContextMenu({
		id: positionContextMenuID,
	});
	const handlePositionContextMenu = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		//document.getElementById("model_part_" + item.id)?.click();
		showPositionContextMenu({
			event,
		});
		event.preventDefault();
	};

	const rotationSetVec = (x: number, y: number, z: number) => {
		if (selected !== -1) {
			console.log('Setting rotation for', selected, 'to', [x, y, z]);
			dispatch(meshModifyIndex({ index: cube.id, rotation: [x, y, z] }));
		}
	};
	const rotationContextMenuID = 'cubePartView_rotation';
	const { show: showRotationContextMenu } = useContextMenu({
		id: rotationContextMenuID,
	});
	const handleRotationContextMenu = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		//document.getElementById("model_part_" + item.id)?.click();
		showRotationContextMenu({
			event,
		});
		event.preventDefault();
	};

	const pivotSetVec = (x: number, y: number, z: number) => {
		if (selected !== -1) {
			console.log('Setting pivot for', selected, 'to', [x, y, z]);
			dispatch(meshModifyIndex({ index: cube.id, pivot: [x, y, z] }));
		}
	};
	const pivotContextMenuID = 'cubePartView_pivot';
	const { show: showPivotContextMenu } = useContextMenu({
		id: pivotContextMenuID,
	});
	const handlePivotContextMenu = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		//document.getElementById("model_part_" + item.id)?.click();
		showPivotContextMenu({
			event,
		});
		event.preventDefault();
	};

	return (
		<SideBarWidget name={cube?.name ?? ''}>
			{cube ? (
				<>
					<div
						className="pointer-events-auto flex h-auto w-full flex-col items-center justify-center rounded-sm border-main-800 bg-main-500 p-1"
						onContextMenuCapture={(e) => {
							handlePositionContextMenu(e);
						}}
						onClick={(e) => {
							console.log('click');
							e.currentTarget.focus();
							e.preventDefault();
						}}
						onMouseOver={(e) => {
							e.currentTarget.focus();
						}}
						onPaste={(e) => {
							const data = e.clipboardData.getData('text');
							const datasplit = stringToVector(data);
							positionSetVec(
								datasplit.x,
								datasplit.y,
								datasplit.z
							);
						}}
						onCopy={(e) => {
							console.log('copy');
							e.clipboardData.setData(
								'text/plain',
								cube.position.join(' ')
							);
							console.log('Copied', cube.position.join(' '));
							e.preventDefault();
						}}
						onFocus={() => {
							console.log('focus');
						}}
					>
						<div className="flex flex-col space-y-1 text-sm">
							<p>Position</p>

							<div className="flex h-full w-full flex-row items-center justify-between">
								<NumberDisplayVec3
									vec={cube.position}
									setVec={positionSetVec}
								/>
								<button
									className="m-0 ml-1 flex h-full w-min items-center justify-center rounded-md bg-transparent p-1 px-0 hover:bg-button-hover"
									onClick={(e) => {
										handlePositionContextMenu(e);
									}}
								>
									<Icon
										name="ellipsis-vertical"
										height={18}
										width={18}
										colour="white"
									/>
								</button>
							</div>

							<div className="mx-auto flex w-11/12 flex-row items-center justify-center rounded-md bg-secondary-500 p-0.5"></div>
						</div>
						<Menu
							id={positionContextMenuID}
							theme="contextTheme"
							className="text-sm"
						>
							<ContextInfoItem
								label={'Position ' + cube.position.join(' ')}
								title="Position of cube"
							/>
							<ContextCopyPasteItem
								shiftKey={true}
								copyTitle="Copy Vector"
								pasteTitle="Paste Vector"
								copyFunc={() => {
									console.log('Copy');
									navigator.clipboard.writeText(
										cube.position.join(' ')
									);
								}}
								pasteFunc={() => {
									console.log('Paste');
									getClipboardDataAsVector(cube.position)
										.then((vec) => {
											positionSetVec(
												vec[0],
												vec[1],
												vec[2]
											);
										})
										.catch((err) => {
											console.error(err);
											dispatch(
												addError({
													type: 'Clipboard',
													error: 'Pasting Vector',
													info: err.toString(),
													advice: 'advice here',
												})
											);
										});
								}}
							/>
							<Separator />

							<ContextItem label="Round Position" />
							<ContextItem label="Truncate Position" />
							<ContextItem
								label="Set Position to Zero"
								callback={() => {
									positionSetVec(0, 0, 0);
								}}
							/>
						</Menu>
					</div>

					<div
						className="pointer-events-auto flex w-auto flex-col items-center justify-center rounded-sm border-b-2 border-main-800 bg-main-500 p-1"
						onContextMenuCapture={(e) => {
							handleRotationContextMenu(e);
						}}
						onClick={(e) => {
							console.log('click');
							e.currentTarget.focus();
							e.preventDefault();
						}}
						onMouseOver={(e) => {
							e.currentTarget.focus();
						}}
						onPaste={(e) => {
							getClipboardDataAsVector(cube.position).then(
								(vec) => {
									console.log('Pasted', vec);
									positionSetVec(vec[0], vec[1], vec[2]);
								}
							);
							// const data = e.clipboardData.getData('text');
							// const datasplit = stringToVector(data);
							// rotationSetVec(
							// 	datasplit.x,
							// 	datasplit.y,
							// 	datasplit.z
							// );
						}}
						onCopy={(e) => {
							console.log('copy');
							e.clipboardData.setData(
								'text/plain',
								cube.rotation.join(' ')
							);
							console.log('Copied', cube.rotation.join(' '));
							e.preventDefault();
						}}
						onFocus={() => {
							console.log('focus');
						}}
					>
						<div className="flex flex-col items-center justify-center space-y-1 text-sm">
							<p className="w-full justify-start">Rotation</p>
							<div className="flex h-full w-full flex-row items-center justify-between">
								<NumberDisplayVec3
									vec={[
										(cube.rotation[0] * 180) / Math.PI,
										(cube.rotation[1] * 180) / Math.PI,
										(cube.rotation[2] * 180) / Math.PI,
									]}
									setVec={rotationSetVec}
								/>
								<button
									className="m-0 ml-1 flex h-full w-min items-center justify-center rounded-md bg-transparent p-1 px-0 hover:bg-button-hover"
									onClick={(e) => {
										handleRotationContextMenu(e);
									}}
								>
									<Icon
										name="ellipsis-vertical"
										height={18}
										width={18}
										colour="white"
									/>
								</button>
							</div>
							<div className="mx-auto flex w-11/12 flex-row items-center justify-center rounded-md bg-secondary-500 p-0.5"></div>
						</div>
						<Menu
							id={rotationContextMenuID}
							theme="contextTheme"
							className="text-sm"
						>
							<ContextInfoItem
								label={'Rotation ' + cube.rotation.join(' ')}
								title="Rotation of cube"
							/>
							<ContextCopyPasteItem
								shiftKey={true}
								copyTitle="Copy Vector"
								pasteTitle="Paste Vector"
								copyFunc={() => {
									console.log('Copy');
									navigator.clipboard.writeText(
										cube.rotation.join(' ')
									);
								}}
								pasteFunc={() => {
									console.log('Paste');
									navigator.clipboard
										.readText()
										.then((text) => {
											const datasplit =
												stringToVector(text);
											console.log('Pasted', datasplit);
											rotationSetVec(
												datasplit.x,
												datasplit.y,
												datasplit.z
											);
										});
								}}
							/>
							<Separator />

							<ContextItem label="Round Rotation" />
							<ContextItem label="Truncate Rotation" />
							<ContextItem label="Set Rotation to Zero" />
						</Menu>
					</div>

					<div
						className="pointer-events-auto flex w-auto flex-col items-center justify-center rounded-sm border-main-800 bg-main-500 p-1"
						onContextMenuCapture={(e) => {
							handlePositionContextMenu(e);
						}}
						onClick={(e) => {
							console.log('click');
							e.currentTarget.focus();
							e.preventDefault();
						}}
						onMouseOver={(e) => {
							e.currentTarget.focus();
						}}
						onPaste={(e) => {
							const data = e.clipboardData.getData('text');
							const datasplit = getClipboardDataAsVector(data);
							positionSetVec(
								datasplit.x,
								datasplit.y,
								datasplit.z
							);
						}}
						onCopy={(e) => {
							console.log('copy');
							e.clipboardData.setData(
								'text/plain',
								cube.position.join(' ')
							);
							console.log('Copied', cube.position.join(' '));
							e.preventDefault();
						}}
						onFocus={() => {
							console.log('focus');
						}}
					>
						<div className="flex flex-col space-y-1 text-sm">
							<p>Pivot</p>

							<div className="flex h-full w-full flex-row items-center justify-between">
								<NumberDisplayVec3
									vec={cube.pivot}
									setVec={pivotSetVec}
								/>
								<button
									className="m-0 ml-1 flex h-full w-min items-center justify-center rounded-md bg-transparent p-1 px-0 hover:bg-button-hover"
									onClick={(e) => {
										handlePivotContextMenu(e);
									}}
								>
									<Icon
										name="ellipsis-vertical"
										height={18}
										width={18}
										colour="white"
									/>
								</button>
							</div>

							<div className="mx-auto flex w-11/12 flex-row items-center justify-center rounded-md bg-secondary-500 p-0.5"></div>
						</div>
						<Menu
							id={pivotContextMenuID}
							theme="contextTheme"
							className="text-sm"
						>
							<ContextInfoItem
								label={'Pivot ' + cube.position.join(' ')}
								title="Pivot of cube"
							/>
							<ContextCopyPasteItem
								shiftKey={true}
								copyTitle="Copy Vector"
								pasteTitle="Paste Vector"
								copyFunc={() => {
									console.log('Copy');
									navigator.clipboard.writeText(
										cube.pivot.join(' ')
									);
								}}
								pasteFunc={() => {
									console.log('Paste');
									navigator.clipboard
										.readText()
										.then((text) => {
											const datasplit =
												stringToVector(text);
											console.log('Pasted', datasplit);
											pivotSetVec(
												datasplit.x,
												datasplit.y,
												datasplit.z
											);
										});
								}}
							/>
							<Separator />

							<ContextItem label="Round Pivot" />
							<ContextItem label="Truncate Pivot" />
							<ContextItem label="Set Pivot to Zero" />
						</Menu>
					</div>
				</>
			) : (
				<div>nuh uh</div>
			)}
		</SideBarWidget>
	);
};

export default CubePartView;

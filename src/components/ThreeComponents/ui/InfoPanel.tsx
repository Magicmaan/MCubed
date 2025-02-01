import React, { useState, useEffect, useRef } from 'react';
import { RootState, useFrame, Vector3 } from '@react-three/fiber';
import * as THREE from 'three';
import Icon from '../../../assets/icons/solid/.all';
import SideBarWidget from '../../templates/SideBarWidget';
import InputSingle from '../../ValueDisplay';
import { toTrun, toTrunPercentage } from '../../../util';
import ToggleButtonIcon from '../../templates/ToggleButtonIcon';
import { Html, OrbitControls } from '@react-three/drei';
import { useAppDispatch } from '../../../hooks/useRedux';
import {
	setControls,
	enableGimbal,
	setCamera,
} from '../../../redux/reducers/viewportReducer';
import ResizeableBar from '../../ResizeableBar';
import { Resizable } from 're-resizable';
import ToolBar from './ToolBar';
import {
	NumberDisplaySingle,
	NumberDisplayVec3,
} from '../../templates/NumberDisplay';
import { Button } from '../../ui/button';
import DisplayDropDown from './DisplayDropDown';

const CameraDisplay: React.FC<{
	camera?: THREE.PerspectiveCamera;
	pivot: THREE.Vector3;
	useGimbal?: [boolean[], React.Dispatch<React.SetStateAction<boolean[]>>];
}> = ({ camera, pivot, useGimbal }) => {
	const [viewRange, setViewRange] = useState([16, 16, 16]);
	const [viewRangeScale, setViewRangeScale] = useState(1);
	const [axis, setAxis] = useState<'X' | 'Z'>('X');

	const camPos = [
		camera?.position.x ?? 0,
		camera?.position.y ?? 0,
		camera?.position.z ?? 0,
	];

	const normalizedCamPos = camPos.map(
		(pos, index) => pos / (viewRange[index] * viewRangeScale)
	);
	let camX = toTrun(normalizedCamPos[0] * 100 + 50);
	let camY = toTrun(normalizedCamPos[1] * 100 + 50);
	let camZ = toTrun(normalizedCamPos[2] * 100 + 50);

	const pivotPos = [pivot?.x, pivot?.y, pivot?.z];
	const normalizedPivotPos = pivotPos.map(
		(pos, index) => pos / (viewRange[index] * viewRangeScale)
	);
	let pivotX = toTrun(normalizedPivotPos[0] * 100 + 50);
	let pivotY = toTrun(normalizedPivotPos[1] * 100 + 50);
	let pivotZ = toTrun(normalizedPivotPos[2] * 100 + 50);

	const camXstr = toTrunPercentage(camX);
	const camZstr = toTrunPercentage(camZ);
	const pivotXstr = toTrunPercentage(pivotX);
	const pivotZstr = toTrunPercentage(pivotZ);

	const camRadius3D = React.useRef<number | null>(null);
	camRadius3D.current = Math.sqrt(
		Math.pow(camX - pivotX, 2) +
			Math.pow(camY - pivotY, 2) +
			Math.pow(camZ - pivotZ, 2)
	);
	const camRadius2D = React.useRef<number | null>(null);
	camRadius2D.current = parseFloat(
		Math.sqrt(
			Math.pow(camX - pivotX, 2) + Math.pow(camZ - pivotZ, 2)
		).toFixed(2)
	);

	const zoomTimer = React.useRef<number>(0);

	useEffect(() => {
		if (camRadius2D.current) {
			var radius = parseFloat(camRadius2D.current.toFixed(2));
			if (
				camX > 100 ||
				camX < 0 ||
				camZ > 100 ||
				camZ < 0 ||
				radius > 40
			) {
				setViewRangeScale((prev) => prev * 1.1);
			}
			if (radius < 10) {
				setViewRangeScale((prev) => prev / 1.1);
			}
		}
	}, [camRadius2D.current, camX, camZ]);

	useEffect(() => {
		setViewRangeScale(1);
	}, [axis]);

	const drawCanvas = (ctx: CanvasRenderingContext2D) => {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.lineWidth = 0.5;
		const scale = viewRangeScale;
		const farGridOpacity = scale / 3 < 1 ? scale / 3 : 1;
		const closeGridOpacity = 1 - farGridOpacity;

		const drawGrid = (opacity: number, color?: string) => {
			ctx.save();
			const gridCount = 16 * scale;
			ctx.strokeStyle = color ?? `rgba(128, 128, 128, ${opacity})`;
			for (let i = -gridCount / 2; i <= gridCount / 2; i++) {
				const pos = (i + gridCount / 2) * (50 / gridCount);
				ctx.beginPath();
				ctx.moveTo(0, pos);
				ctx.lineTo(100, pos);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(pos, 0);
				ctx.lineTo(pos, 100);
				ctx.stroke();
				ctx.restore();
			}
		};

		const drawCircle = (
			x: number,
			y: number,
			radius: number,
			color: string
		) => {
			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.restore();
		};

		const drawRing = (
			x: number,
			y: number,
			radius: number,
			color: string
		) => {
			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.restore();
		};

		ctx.fillStyle = '#1e1e20';
		ctx.fillRect(0, 0, 100, 100);
		drawGrid(closeGridOpacity, 'green');
		drawRing(pivotX, pivotZ, camRadius2D.current, 'green');
		drawCircle(camX, camZ, 4, 'red');
		drawCircle(pivotX, pivotZ, 2, 'red');

		drawCircle(50, 50, 3, 'blue');
	};

	return (
		<div className="flex aspect-square h-full w-full items-center justify-center rounded-md bg-red-500">
			<canvas
				width="100%"
				height="100%"
				ref={(canvas) => {
					if (canvas) {
						const ctx = canvas.getContext('2d');
						if (ctx) {
							drawCanvas(ctx);
						}
					}
				}}
			/>
		</div>
	);
};

const InfoValue: React.FC<{ name: string; value: number }> = ({
	name,
	value,
}) => {
	return (
		<div className="flex flex-row flex-nowrap space-x-2 pl-2">
			<p className="text-sm">{name}</p>
			<p>{value}</p>
		</div>
	);
};

const InfoPanel: React.FC<{
	scene: RootState | undefined;
	camera: React.RefObject<THREE.PerspectiveCamera> | null;
	pivot: React.RefObject<THREE.Group<THREE.Object3DEventMap>>;
	useGimbal: [boolean[], React.Dispatch<React.SetStateAction<boolean[]>>];
	orbit: React.RefObject<typeof OrbitControls & { target: THREE.Vector3 }>;
}> = ({
	scene,
	camera: camRef,
	pivot: pivotRef,
	useGimbal,
	orbit: orbitRef,
}) => {
	const [showInfo, setShowInfo] = useState(false);
	// const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(
	// 	camRef?.current ?? null
	// );
	const [refresh, setRefresh] = useState(0);
	const dispatch = useAppDispatch();

	const [cam, setCam] = useState<THREE.PerspectiveCamera | null>(
		camRef.current
	);

	const snapPivotToggle = React.useRef(false);

	const LockButton = (
		<ToggleButtonIcon
			isActive={false}
			onClick={() => {}}
			Icon_on={
				<Icon name="lock" height={18} width={18} colour="#d1d1d1" />
			}
			Icon_off={
				<Icon
					name="lock-open"
					height={12}
					width={12}
					colour="#888888"
				/>
			}
		/>
	);

	useFrame(() => {
		if (camRef.current) {
			//console.log("cam pos", camRef.current.position);
			//setPivotPos(camRef.current.position);
			setCam(camRef.current);
			setRefresh((prev) => prev + 1);
			const viewportSize = {
				width: window.innerWidth,
				height: window.innerHeight,
			};
		}
	});
	const position = cam?.position ?? new THREE.Vector3(0, 0, 0);
	const rotation = cam?.rotation ?? new THREE.Euler(0, 0, 0);
	const pivot = orbitRef.current?.target ?? new THREE.Vector3(0, 0, 0);
	const distance =
		orbitRef.current?.target.distanceTo(
			cam?.position ?? new THREE.Vector3(0, 0, 0)
		) ?? 0;

	const lockDistance = useRef(false);
	const lockRotate = useRef(false);
	const lockPivot = useRef(false);
	return (
		<Html
			position={[0, 0, 0]}
			fullscreen
			className="pointer-events-none absolute select-none flex-col rounded-xl p-2"
		>
			<div className="flex w-full flex-row items-stretch">
				<ToolBar dispatch={dispatch}>
					<div className="pointer-events-auto flex aspect-square h-full w-auto items-center justify-center">
						<div className="absolute flex w-auto flex-col items-end justify-end">
							<Button
								variant={'outline'}
								onClick={() => setShowInfo(!showInfo)}
								className="m-0 aspect-square h-8 items-center justify-center p-0"
							>
								<Icon
									name="clapperboard"
									colour="white"
									width={16}
									height={16}
								/>
							</Button>

							<div className="absolute right-0 translate-y-full">
								{showInfo && (
									<div className="pointer-events-auto flex w-80 flex-col rounded-md bg-matisse-900 p-2">
										<div className="flex h-min w-full flex-col items-start justify-start rounded-md bg-main p-2 pl-0">
											<h2 className="pl-2">Camera</h2>

											<div className="flex w-min flex-row flex-nowrap items-start justify-start bg-main p-1 pb-0 pl-0">
												<div className="m-2 flex w-auto flex-col justify-center rounded-md bg-main-500 p-3">
													<p className="text-sm text-text">
														Distance
													</p>
													<div className="row flex w-48 justify-start rounded-sm">
														<NumberDisplaySingle
															index={0}
															value={distance}
															setValue={(
																value
															) => {
																const newDistance =
																	value; // Adjust the value as needed
																const direction =
																	new THREE.Vector3()
																		.subVectors(
																			cam?.position ??
																				new THREE.Vector3(),
																			orbitRef
																				.current
																				?.target ??
																				new THREE.Vector3()
																		)
																		.normalize();
																const newPosition =
																	direction
																		.multiplyScalar(
																			newDistance
																		)
																		.add(
																			orbitRef
																				.current
																				?.target ??
																				new THREE.Vector3()
																		);
																cam?.position.copy(
																	newPosition
																);
															}}
														/>
													</div>
												</div>
												<div className="dark m-auto flex h-full w-auto flex-col justify-between space-y-1 bg-red-500">
													<Button
														variant={'outline'}
														className="pointer-events-auto m-0 aspect-square h-7 w-7 p-0"
														onClick={() => {
															console.log(
																'lock distance'
															);
															if (
																lockDistance.current
															) {
																dispatch(
																	setControls(
																		{
																			zoom: false,
																		}
																	)
																);
															} else {
																dispatch(
																	setControls(
																		{
																			zoom: true,
																		}
																	)
																);
															}
															lockDistance.current =
																!lockDistance.current;
														}}
													>
														{lockDistance.current ? (
															<Icon
																name="lock-open"
																width={16}
																height={16}
																colour="#bbbbbb"
															/>
														) : (
															<Icon
																name="lock"
																width={16}
																height={16}
																colour="#bbbbbb"
															/>
														)}
													</Button>
												</div>
											</div>

											<div className="flex w-min flex-row flex-nowrap items-start justify-start bg-main p-1 pb-0 pl-0 pt-0">
												<div className="m-2 flex w-auto flex-col justify-center rounded-md bg-main-500 p-3">
													<p className="text-sm text-text">
														Rotation
													</p>
													<div className="row flex w-48 justify-start rounded-sm">
														<NumberDisplayVec3
															vec={[
																(rotation.x *
																	180) /
																	Math.PI,
																(rotation.y *
																	180) /
																	Math.PI,
																(rotation.z *
																	180) /
																	Math.PI,
															]}
															setVec={(
																x,
																y,
																z
															) => {
																orbitRef.current?.target.copy(
																	new THREE.Vector3(
																		x *
																			(Math.PI /
																				180),
																		y *
																			(Math.PI /
																				180),
																		z *
																			(Math.PI /
																				180)
																	)
																);
															}}
														/>
													</div>
												</div>
												<div className="dark m-auto flex h-full w-auto flex-col justify-between space-y-1 bg-red-500">
													<Button
														variant={'outline'}
														title="To 0"
														className="m-0 aspect-square h-7 w-7 p-0"
														onClick={() => {
															orbitRef.current?.target.copy(
																new THREE.Vector3(
																	0,
																	0,
																	0
																)
															);
														}}
													>
														<Icon
															name="arrows-to-dot"
															width={16}
															height={16}
															colour="#bbbbbb"
														/>
													</Button>

													<Button
														variant={'outline'}
														title="Round Rotation"
														className="m-0 aspect-square h-7 w-7 p-0"
														onClick={() => {
															orbitRef.current?.target.copy(
																new THREE.Vector3(
																	Math.round(
																		(rotation.x *
																			180) /
																			Math.PI
																	),
																	Math.round(
																		(rotation.y *
																			180) /
																			Math.PI
																	),
																	Math.round(
																		(rotation.z *
																			180) /
																			Math.PI
																	)
																)
															);
														}}
													>
														<Icon
															name="border-all"
															width={16}
															height={16}
															colour="#bbbbbb"
														/>
													</Button>

													<Button
														variant={'outline'}
														className="pointer-events-auto m-0 aspect-square h-7 w-7 p-0"
														onClick={() => {
															console.log(
																'lock rotation'
															);
															if (
																lockRotate.current
															) {
																dispatch(
																	setControls(
																		{
																			rotate: false,
																		}
																	)
																);
															} else {
																dispatch(
																	setControls(
																		{
																			rotate: true,
																		}
																	)
																);
															}
															lockRotate.current =
																!lockRotate.current;
														}}
													>
														{lockRotate.current ? (
															<Icon
																name="lock-open"
																width={16}
																height={16}
																colour="#bbbbbb"
															/>
														) : (
															<Icon
																name="lock"
																width={16}
																height={16}
																colour="#bbbbbb"
															/>
														)}
													</Button>
												</div>
											</div>

											<div className="flex w-min flex-row flex-nowrap items-center justify-start bg-main p-1 pl-0">
												<div className="m-2 flex w-auto flex-col justify-center rounded-md bg-main-500 p-3">
													<p className="text-sm text-text">
														Pivot
													</p>
													<div className="row flex w-48 justify-start rounded-sm">
														<NumberDisplayVec3
															size="small"
															vec={[
																pivot.x,
																pivot.y,
																pivot.z,
															]}
															setVec={(
																x,
																y,
																z
															) => {
																orbitRef.current?.target.copy(
																	new THREE.Vector3(
																		x,
																		y,
																		z
																	)
																);
															}}
														/>
													</div>
												</div>
												<div className="dark m-auto flex h-full w-auto flex-col justify-between space-y-1 bg-red-500">
													<Button
														variant={'outline'}
														title="To 0"
														className="m-0 aspect-square h-7 w-7 p-0"
														onClick={() => {
															orbitRef.current?.target.copy(
																new THREE.Vector3(
																	0,
																	0,
																	0
																)
															);
														}}
													>
														<Icon
															name="arrows-to-dot"
															width={16}
															height={16}
															colour="#bbbbbb"
														/>
													</Button>

													<Button
														variant={'outline'}
														title="Round Pivot"
														className="m-0 aspect-square h-7 w-7 p-0"
														onClick={() => {
															orbitRef.current?.target.copy(
																new THREE.Vector3(
																	Math.round(
																		pivot.x
																	),
																	Math.round(
																		pivot.y
																	),
																	Math.round(
																		pivot.z
																	)
																)
															);
														}}
													>
														<Icon
															name="border-all"
															alt_text="Round Pivot"
															width={16}
															height={16}
															colour="#bbbbbb"
														/>
													</Button>

													<Button
														variant={'outline'}
														className="pointer-events-auto m-0 aspect-square h-7 w-7 p-0"
														onClick={() => {
															console.log(
																'lock pivot'
															);
															if (
																lockPivot.current
															) {
																dispatch(
																	setControls(
																		{
																			pan: false,
																		}
																	)
																);
															} else {
																dispatch(
																	setControls(
																		{
																			pan: true,
																		}
																	)
																);
															}
															lockPivot.current =
																!lockPivot.current;
														}}
													>
														{lockPivot.current ? (
															<Icon
																name="lock-open"
																width={16}
																height={16}
																colour="#bbbbbb"
															/>
														) : (
															<Icon
																name="lock"
																width={16}
																height={16}
																colour="#bbbbbb"
															/>
														)}
													</Button>
												</div>
											</div>
										</div>
										<CameraDisplay
											camera={cam}
											pivot={pivot}
										/>
										<p>Camera Controls</p>
										<p>Lock Radius</p>
										<button
											onClick={() => {
												useGimbal[1]((prev) => [
													prev[0],
													!prev[0],
													prev[2],
												]);
											}}
										>
											Toggle Pan
										</button>
										<div>
											<button
												onClick={() =>
													setRefresh(
														(prev) => prev + 1
													)
												}
											>
												Toggle Refresh
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</ToolBar>
			</div>
		</Html>
	);
};

export default InfoPanel;

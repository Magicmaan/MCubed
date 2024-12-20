import React, { useState, useEffect, useRef } from "react";
import { RootState, useFrame, Vector3 } from "@react-three/fiber";
import * as THREE from "three";
import Icon from "../../../assets/icons/solid/.all";
import SideBarWidget from "../../templates/SideBarWidget";
import InputSingle from "../../ValueDisplay";
import { toTrun, toTrunPercentage } from "../../../util";
import ToggleButtonIcon from "../../templates/ToggleButtonIcon";
import { Html, OrbitControls } from "@react-three/drei";
import { useAppDispatch } from "../../../hooks/useRedux";
import { disableGimbal, enableGimbal } from "../../../reducers/viewportReducer";
import ResizeableBar from "../../ResizeableBar";
import { Resizable } from "re-resizable";
import ToolBar from "./ToolBar";
import { NumberDisplaySingle, NumberDisplayVec3 } from "../../templates/NumberDisplay";

const CameraDisplay: React.FC<{
	camera?: THREE.PerspectiveCamera;
	pivot: THREE.Vector3;
	useGimbal?: [boolean[], React.Dispatch<React.SetStateAction<boolean[]>>];
}> = ({ camera, pivot, useGimbal }) => {
	const [viewRange, setViewRange] = useState([16, 16, 16]);
	const [viewRangeScale, setViewRangeScale] = useState(1);
	const [axis, setAxis] = useState<"X" | "Z">("X");

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
		Math.pow(camX - pivotX, 2) + Math.pow(camY - pivotY, 2) + Math.pow(camZ - pivotZ, 2)
	);
	const camRadius2D = React.useRef<number | null>(null);
	camRadius2D.current = parseFloat(
		Math.sqrt(Math.pow(camX - pivotX, 2) + Math.pow(camZ - pivotZ, 2)).toFixed(2)
	);

	const zoomTimer = React.useRef<number>(0);

	useEffect(() => {
		if (camRadius2D.current) {
			var radius = parseFloat(camRadius2D.current.toFixed(2));
			if (camX > 100 || camX < 0 || camZ > 100 || camZ < 0 || radius > 40) {
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

		const drawCircle = (x: number, y: number, radius: number, color: string) => {
			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.restore();
		};

		const drawRing = (x: number, y: number, radius: number, color: string) => {
			ctx.save();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI);
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.restore();
		};

		ctx.fillStyle = "#1e1e20";
		ctx.fillRect(0, 0, 100, 100);
		drawGrid(closeGridOpacity, "green");
		drawRing(pivotX, pivotZ, camRadius2D.current, "green");
		drawCircle(camX, camZ, 4, "red");
		drawCircle(pivotX, pivotZ, 2, "red");

		drawCircle(50, 50, 3, "blue");
	};

	return (
		<div className="flex aspect-square w-full h-full rounded-md bg-red-500 justify-center items-center">
			<canvas
				width="100%"
				height="100%"
				ref={(canvas) => {
					if (canvas) {
						const ctx = canvas.getContext("2d");
						if (ctx) {
							drawCanvas(ctx);
						}
					}
				}}
			/>
		</div>
	);
};

const InfoValue: React.FC<{ name: string; value: number }> = ({ name, value }) => {
	return (
		<div className="flex flex-row space-x-2 pl-2 flex-nowrap">
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
}> = ({ scene, camera: camRef, pivot: pivotRef, useGimbal, orbit: orbitRef }) => {
	const [showInfo, setShowInfo] = useState(false);
	const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(
		camRef?.current ?? null
	);
	const [refresh, setRefresh] = useState(0);
	const dispatch = useAppDispatch();

	// used to refresh the data on demand
	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		setRefresh((prev) => prev + 1);
	// 	}, 200); // Toggle refresh every 1 second
	// 	return () => clearInterval(interval); // Cleanup on unmount
	// }, []);

	//const cam: THREE.PerspectiveCamera | null = camRef.current;
	const [cam, setCam] = useState<THREE.PerspectiveCamera | null>(camRef.current);

	const snapPivotToggle = React.useRef(false);

	const LockButton = (
		<ToggleButtonIcon
			isActive={false}
			onClick={() => {}}
			Icon_on={<Icon name="lock" height={10} width={10} colour="#d1d1d1" />}
			Icon_off={<Icon name="lock-open" height={12} width={12} colour="#888888" />}
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
		orbitRef.current?.target.distanceTo(cam?.position ?? new THREE.Vector3(0, 0, 0)) ?? 0;

	const lockDistance = useRef(false);
	useEffect(() => {
		if (lockDistance.current) {
			dispatch(disableGimbal([false, false, false]));
		}
	}, [lockDistance.current]);

	return (
		<Html
			position={[0, 0, 0]}
			fullscreen
			className="flex-col select-none absolute pointer-events-none rounded-xl p-2">
			<div className="w-full h-10 justify-start bg-main bg-opacity-50 flex flex-row gap-5 rounded-full select-none pointer-events-none">
				<ToolBar />
				<div className=" w-auto h-full flex flex-grow justify-end items-end ">
					<div className="flex w-auto h-full  p-1 bg-primary items-start justify-start pointer-events-none">
						<div
							className={
								"pointer-events-auto transition-all duration-100  " +
								"aria-expanded:scale-0 scale-100 h-full aspect-square " +
								"bg-primary flex items-center justify-center bg-blue-500 " +
								"rounded-full hover:border-2 border-highlight-200"
							}
							aria-expanded={showInfo}
							onClick={() => {
								setShowInfo(!showInfo);
								//console.log("press");
							}}>
							<Icon
								name="question"
								center_x
								height={20}
								width={20}
								colour="red"
								alt_text="increment"
							/>
						</div>

						<ResizeableBar
							aria-expanded={showInfo}
							id="infoPanel"
							width={300}
							resizable={[true, true, true, true]}
							onMouseEnter={() => {
								//dispatch(disableGimbal([false, false, false]));
							}}
							onMouseLeave={() => {
								// if (!lockDistance.current) {
								// 	dispatch(enableGimbal());
								// }
							}}
							className={
								"overflow-y-show pointer-events-auto select-none transition-all duration-500 origin-top-right " +
								"absolute w-96 h-72 bg-secondary items-stretch justify-stretch " +
								"rounded-xl space-y-2 flex-shrink-0 scale-0 aria-expanded:scale-100 " +
								"aria-expanded:rounded-xl aria-expanded:top-0 aria-expanded:right-0 "
							}>
							<SideBarWidget
								name="Info"
								showExitButton
								onExit={() => setShowInfo(!showInfo)}>
								{showInfo ? (
									<div className="flex flex-col space-y-2 items-start justify-start select-none pointer-events-auto overflow-x-hidden w-full h-auto overflow-y-show scrollbar scrollbar-always">
										<h2 className="select-none">Camera</h2>
										<div className="flex flex-row space-x-2 px-2 items-center justify-between h-8 rounded-md ">
											<div className="items-center justify-center text-right content-center h-20 w-20 p-2 rounded-md ">
												<p className="text-sm">Distance</p>
											</div>
											<div className="h-auto w-24 justify-start items-start">
												<NumberDisplaySingle size="small" value={distance} />
											</div>
											<div className="text-sm flex flex-col gap-1  h-auto w-auto ">
												<ToggleButtonIcon
													isActive={false}
													onClick={() => {
														lockDistance.current = !lockDistance.current;
														dispatch(disableGimbal([false, true, false]));
														console.log("toggle distance", lockDistance.current);
													}}
													Icon_on={
														<Icon name="lock" height={10} width={10} colour="#d1d1d1" />
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
											</div>
										</div>
										<div className="flex flex-row space-x-2 px-2 items-center justify-between h-auto w-min rounded-md ">
											<div className="items-center justify-center text-right content-center h-20 w-20 p-2 rounded-md ">
												<p className="text-sm">Rotation</p>
											</div>
											<div className="h-auto w-24">
												<NumberDisplayVec3
													size="small"
													orientation="column"
													vec={[
														(rotation.x * 180) / Math.PI,
														(rotation.y * 180) / Math.PI,
														(rotation.z * 180) / Math.PI,
													]}
												/>
											</div>

											<div className="text-sm flex flex-col gap-1  h-auto w-auto ">
												{LockButton}
												{LockButton}
												{LockButton}
											</div>
										</div>
										<div className="flex flex-row space-x-2 px-2 items-center justify-between h-auto w-min rounded-md ">
											<div className="items-center justify-center text-right content-center h-20 w-20 p-2 rounded-md ">
												<p className="text-sm">Pivot</p>
											</div>
											<div className="h-auto w-24">
												<NumberDisplayVec3
													size="small"
													orientation="column"
													vec={[pivot.x, pivot.y, pivot.z]}
												/>
											</div>
											<div className="text-sm flex flex-col gap-1  h-auto w-auto ">
												<ToggleButtonIcon
													isActive={false}
													onClick={() => {
														orbitRef.current?.target.copy(
															new THREE.Vector3(
																Math.round(pivot.x),
																Math.round(pivot.y),
																Math.round(pivot.z)
															)
														);
													}}
													Icon={
														<Icon
															name="border-all"
															height={16}
															width={16}
															colour="#d1d1d1"
														/>
													}
												/>

												<ToggleButtonIcon
													isActive={true}
													onClick={() => {
														orbitRef.current?.target.copy(new THREE.Vector3(0, 0, 0));
													}}
													Icon_on={
														<Icon
															name="arrows-to-dot"
															height={16}
															width={16}
															colour="#d1d1d1"
														/>
													}
													Icon_off={
														<Icon
															name="arrows-to-dot"
															height={16}
															width={16}
															colour="#888888"
														/>
													}
												/>
											</div>
										</div>

										<CameraDisplay camera={cam} pivot={pivot} />

										<p className="text-sm">Camera Controls</p>
										<p className="text-sm">Lock Radius</p>
										<button
											className="bg-blue-500 text-white px-2 py-1 rounded"
											onClick={() => {
												useGimbal[1]((prev) => [prev[0], !prev[0], prev[2]]);
												console.log("toggle rad", useGimbal[0]);
											}}>
											Toggle Pan
										</button>
									</div>
								) : null}

								<div className="flex flex-row space-x-2 pl-2 ">
									<button
										className="bg-blue-500 text-white px-2 py-1 rounded"
										onClick={() => setRefresh((prev) => prev + 1)}>
										Toggle Refresh
									</button>
								</div>
							</SideBarWidget>
						</ResizeableBar>
					</div>
				</div>
			</div>
		</Html>
	);
};

export default InfoPanel;

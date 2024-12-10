import React, { useState, useEffect } from "react";
import { RootState, Vector3 } from "@react-three/fiber";
import * as THREE from "three";
import Icon from "../../assets/icons/solid/.all";
import SideBarWidget from "../templates/SideBarWidget";
import InputSingle from "../ValueDisplay";
import { toTrun, toTrunPercentage } from "../../util";

const CameraDisplay: React.FC<{
	camera?: THREE.PerspectiveCamera;
	pivot?: React.MutableRefObject<Vector3>;
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

	const pivotPos = [pivot?.current.x, pivot?.current.y, pivot?.current.z];
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
	pivot: React.MutableRefObject<Vector3>;
	useGimbal: [boolean[], React.Dispatch<React.SetStateAction<boolean[]>>];
}> = ({ scene, camera: camRef, pivot, useGimbal }) => {
	const [showInfo, setShowInfo] = useState(false);
	const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(
		camRef?.current ?? null
	);
	const [refresh, setRefresh] = useState(0);

	// used to refresh the data on demand
	useEffect(() => {
		const interval = setInterval(() => {
			setRefresh((prev) => prev + 1);
		}, 200); // Toggle refresh every 1 second
		return () => clearInterval(interval); // Cleanup on unmount
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			setCamera(camRef?.current);
		}, 1); // Refresh every 1 second
		return () => clearInterval(interval); // Cleanup on unmount
	}, [camRef?.current]);

	return (
		<div className="absolute top-2 left-2 right-2 bottom-2 bg-primary items-start justify-start p-20 pointer-events-none">
			<div
				className={
					"pointer-events-auto transition-all duration-100  absolute right-0 aria-expanded:scale-0 scale-100 top-0 w-9 aspect-square bg-primary flex items-center justify-center bg-blue-500 rounded-full hover:border-2 border-highlight-200"
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
			<div
				aria-expanded={showInfo}
				className={
					" pointer-events-auto transition-all duration-800 absolute right-2 top-2 w-52 h-auto bg-primary flex items-center justify-center hover:border-2 border-highlight-200 scale-0 aria-expanded:scale-100 aria-expanded:rounded-xl aria-expanded:top-0 aria-expanded:right-0 origin-top-right"
				}>
				<SideBarWidget name="Info" showExitButton onExit={() => setShowInfo(!showInfo)}>
					{showInfo ? (
						<div className="flex flex-col space-y-2 select-none">
							<h2 className="select-none">Camera</h2>
							<div className="flex flex-row space-x-2 pl-2">
								<p className="text">Position</p>
								<div className="text-sm flex flex-col">
									<InfoValue name="X" value={camera?.position.x} />
									<InputSingle name="X" value={camera?.position.x} inputType="Position" />
									<p>{camera?.position.x.toFixed(2)}</p>
									<p>{camera?.position.y.toFixed(2)}</p>
									<p>{camera?.position.z.toFixed(2)}</p>
								</div>
							</div>
							<div className="flex flex-row space-x-2 pl-2">
								<p className=" text-sm">Rotation</p> {/* x = up/down  */}
								{"X:"}
								{(((camera?.rotation.x ?? 1) * 180) / Math.PI).toFixed(2)}
								{" Y:"}
								{(((camera?.rotation.y ?? 1) * 180) / Math.PI).toFixed(2)}
								<p className=" text-sm">FOV</p> {camera?.fov.toFixed(2)}
							</div>
							<div className="flex flex-row space-x-2 pl-2">
								<p className="text-sm">Pivot</p>
								<p>{`X: ${pivot.current.x.toFixed(2)}`}</p>
								<p>{`Y: ${pivot.current.y.toFixed(2)}`}</p>
								<p>{`Z: ${pivot.current.z.toFixed(2)}`}</p>
							</div>

							<CameraDisplay camera={camera} pivot={pivot} />

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
			</div>
		</div>
	);
};

export default InfoPanel;

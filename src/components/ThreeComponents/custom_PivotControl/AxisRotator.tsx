import * as React from 'react';
import * as THREE from 'three';
import { ThreeEvent, useLoader, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Html } from '@react-three/drei';
import { context } from './context';
import icon from '../../../assets/curve.png';
import { useModifiers } from '../../../hooks/useControls';
import { round } from '../../../util';
import { rotateModifierIncrement } from '../../../constants/KeyModifiers';
import {
	useMeshDataSelector,
	useViewportSelectedSelector,
} from '../../../hooks/useRedux';

const clickDir = /* @__PURE__ */ new THREE.Vector3();
const intersectionDir = /* @__PURE__ */ new THREE.Vector3();

const toDegrees = (radians: number) => (radians * 180) / Math.PI;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const calculateAngle = (
	clickPoint: THREE.Vector3,
	intersectionPoint: THREE.Vector3,
	origin: THREE.Vector3,
	e1: THREE.Vector3,
	e2: THREE.Vector3
) => {
	clickDir.copy(clickPoint).sub(origin);
	intersectionDir.copy(intersectionPoint).sub(origin);
	const dote1e1 = e1.dot(e1);
	const dote2e2 = e2.dot(e2);
	const uClick = clickDir.dot(e1) / dote1e1;
	const vClick = clickDir.dot(e2) / dote2e2;
	const uIntersection = intersectionDir.dot(e1) / dote1e1;
	const vIntersection = intersectionDir.dot(e2) / dote2e2;
	const angleClick = Math.atan2(vClick, uClick);
	const angleIntersection = Math.atan2(vIntersection, uIntersection);
	return angleIntersection - angleClick;
};

const fmod = (num: number, denom: number) => {
	let k = Math.floor(num / denom);
	k = k < 0 ? k + 1 : k;

	return num - k * denom;
};

const minimizeAngle = (angle: number) => {
	let result = fmod(angle, 2 * Math.PI);

	if (Math.abs(result) < 1e-6) {
		return 0.0;
	}

	if (result < 0.0) {
		result += 2 * Math.PI;
	}

	return result;
};

const rotMatrix = /* @__PURE__ */ new THREE.Matrix4();
const posNew = /* @__PURE__ */ new THREE.Vector3();
const ray = /* @__PURE__ */ new THREE.Ray();
const intersection = /* @__PURE__ */ new THREE.Vector3();

export const AxisRotator: React.FC<{
	dir1: THREE.Vector3;
	dir2: THREE.Vector3;
	axis: 0 | 1 | 2;
	usingGimbal: React.MutableRefObject<boolean>;
}> = ({ dir1, dir2, axis, usingGimbal }) => {
	const {
		rotationLimits,
		annotations,
		annotationsClass,
		depthTest,
		scale,
		lineWidth,
		fixed,
		axisColors,
		hoveredColor,
		opacity,
		onDragStart,
		onDrag,
		onDragEnd,
		userData,
	} = React.useContext(context);

	const meshData = useMeshDataSelector();
	const selectedID = useViewportSelectedSelector();
	const selectedCube = meshData.find((item) => item.id === selectedID);

	// @ts-expect-error new in @react-three/fiber@7.0.5
	const camControls = useThree((state) => state.controls) as {
		enabled: boolean;
	};
	const divRef = React.useRef<HTMLDivElement>(null!);
	const objRef = React.useRef<THREE.Group>(null!);
	const angle0 = React.useRef<number>(0);
	const angle = React.useRef<number>(0);
	const { keyModifiers, getMultiplier, getRounded } = useModifiers();
	const clickInfo = React.useRef<{
		clickPoint: THREE.Vector3;
		origin: THREE.Vector3;
		e1: THREE.Vector3;
		e2: THREE.Vector3;
		normal: THREE.Vector3;
		plane: THREE.Plane;
	} | null>(null);
	const [isHovered, setIsHovered] = React.useState(false);

	const onPointerDown = React.useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			if (annotations) {
				divRef.current.innerText = `${toDegrees(angle.current).toFixed(0)}º`;
				divRef.current.style.display = 'block';
			}
			e.stopPropagation();
			const clickPoint = e.point.clone();
			const origin = new THREE.Vector3(
				selectedCube?.position[0] || 0,
				selectedCube?.position[1] || 0,
				selectedCube?.position[2] || 0
			);
			const e1 = new THREE.Vector3()
				.setFromMatrixColumn(objRef.current.matrixWorld, 0)
				.normalize();
			const e2 = new THREE.Vector3()
				.setFromMatrixColumn(objRef.current.matrixWorld, 1)
				.normalize();
			const normal = new THREE.Vector3()
				.setFromMatrixColumn(objRef.current.matrixWorld, 2)
				.normalize();
			const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
				normal,
				origin
			);
			clickInfo.current = { clickPoint, origin, e1, e2, normal, plane };
			onDragStart({
				component: 'Rotator',
				axis,
				origin,
				directions: [e1, e2, normal],
			});
			camControls && (camControls.enabled = false);
			// @ts-ignore
			e.target.setPointerCapture(e.pointerId);
		},
		[annotations, camControls, onDragStart, axis, selectedCube]
	);

	const onPointerMove = React.useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			e.stopPropagation();
			if (!isHovered) setIsHovered(true);
			if (clickInfo.current) {
				const { clickPoint, origin, e1, e2, normal, plane } =
					clickInfo.current;
				const [min, max] = rotationLimits?.[axis] || [
					undefined,
					undefined,
				];

				ray.copy(e.ray);
				ray.intersectPlane(plane, intersection);
				ray.direction.negate();
				ray.intersectPlane(plane, intersection);
				let deltaAngle = calculateAngle(
					clickPoint,
					intersection,
					origin,
					e1,
					e2
				);
				let degrees = toDegrees(deltaAngle);

				// used to throttle small changes, since movement is so granular.
				// This is to prevent jitter and unnecessary dispatches
				if (Math.abs(degrees) < 0.001) return;
				degrees = getRounded(degrees);
				console.log('Degrees: ', degrees);
				deltaAngle = toRadians(degrees);

				if (
					min !== undefined &&
					max !== undefined &&
					max - min < 2 * Math.PI
				) {
					deltaAngle = minimizeAngle(deltaAngle);
					deltaAngle =
						deltaAngle > Math.PI
							? deltaAngle - 2 * Math.PI
							: deltaAngle;
					deltaAngle = THREE.MathUtils.clamp(
						deltaAngle,
						min - angle0.current,
						max - angle0.current
					);
					angle.current = angle0.current + deltaAngle;
				} else {
					angle.current = minimizeAngle(angle0.current + deltaAngle);
					angle.current =
						angle.current > Math.PI
							? angle.current - 2 * Math.PI
							: angle.current;
				}

				if (annotations) {
					degrees = toDegrees(angle.current);
					divRef.current.innerText = `${degrees.toFixed(0)}º`;
				}

				const pos = new THREE.Vector3().setFromMatrixPosition(
					objRef.current.matrixWorld
				);

				const tempRot = new THREE.Matrix4().makeRotationAxis(
					normal,
					angle.current
				);
				const rot = new THREE.Euler().setFromRotationMatrix(tempRot);
				rotMatrix.setPosition(pos);
				rotMatrix.makeRotationFromEuler(rot);

				// posNew
				// 	.copy(origin)
				// 	.applyMatrix4(rotMatrix)
				// 	.sub(origin)
				// 	.negate();
				// rotMatrix.setPosition(posNew);
				onDrag(rotMatrix);
			}
		},
		[annotations, onDrag, isHovered, rotationLimits, axis, selectedCube]
	);

	const onPointerUp = React.useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			if (annotations) {
				divRef.current.style.display = 'none';
			}
			e.stopPropagation();
			angle0.current = angle.current;
			clickInfo.current = null;
			onDragEnd();
			camControls && (camControls.enabled = true);
			// @ts-ignore
			e.target.releasePointerCapture(e.pointerId);
		},
		[annotations, camControls, onDragEnd]
	);

	const onPointerOut = React.useCallback((e: any) => {
		e.stopPropagation();
		setIsHovered(false);
	}, []);

	const matrixL = React.useMemo(() => {
		const dir1N = dir1.clone().normalize();
		const dir2N = dir2.clone().normalize();
		return new THREE.Matrix4().makeBasis(
			dir1N,
			dir2N,
			dir1N.clone().cross(dir2N)
		);
	}, [dir1, dir2]);

	const r = fixed ? 0.65 : scale * 0.65;

	const arc = React.useMemo(() => {
		const segments = 32;
		const points: THREE.Vector3[] = [];
		const scaleFactor = 1.03; // Increase the arc size by 10%
		for (let j = 0; j <= segments; j++) {
			const angle = (j * (Math.PI / 2)) / segments;
			points.push(
				new THREE.Vector3(
					Math.cos(angle) * r * scaleFactor,
					Math.sin(angle) * r * scaleFactor,
					0
				)
			);
		}
		return points;
	}, [r]);

	const texture = useLoader(THREE.TextureLoader, icon);
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;

	return (
		<group
			ref={objRef}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerOut={onPointerOut}
			onPointerEnter={() => (usingGimbal.current = true)}
			onPointerLeave={() => (usingGimbal.current = false)}
			matrix={matrixL}
			matrixAutoUpdate={false}
		>
			{annotations && (
				<Html position={[r, r, 0]}>
					<div
						style={{
							display: 'none',
							background: '#151520',
							color: 'white',
							padding: '6px 8px',
							borderRadius: 7,
							whiteSpace: 'nowrap',
						}}
						className={annotationsClass}
						ref={divRef}
					/>
				</Html>
			)}
			{/* The invisible mesh being raycast */}
			<Line
				points={arc}
				lineWidth={lineWidth}
				visible={false}
				userData={userData}
			/>
			{/* The visible mesh */}

			<Line
				transparent
				raycast={() => null}
				depthTest={depthTest}
				points={arc}
				lineWidth={lineWidth}
				side={THREE.DoubleSide}
				color={(isHovered ? hoveredColor : axisColors[axis]) as any}
				opacity={opacity}
				polygonOffset
				polygonOffsetFactor={-10}
				fog={false}
			/>
		</group>
	);
};

import * as React from "react";
import * as THREE from "three";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Line, Plane, Text, Billboard } from "@react-three/drei";
import { Html } from "@react-three/drei";
import { context } from "./context";
import { Canvas, useLoader } from "@react-three/fiber";
import icon from "../../../assets/arrow.png";
import { darkenColor, lightenColor } from "../../../util/textureUtil";
import { round } from "../../../util";
import { useKey, useKeyPress } from "react-use";
import { useModifiers } from "../../../hooks/useControls";
import { moveModifierIncrement } from "../../../constants/KeyModifiers";

const vec1 = /* @__PURE__ */ new THREE.Vector3();
const vec2 = /* @__PURE__ */ new THREE.Vector3();

export const calculateOffset = (
	clickPoint: THREE.Vector3,
	normal: THREE.Vector3,
	rayStart: THREE.Vector3,
	rayDir: THREE.Vector3
) => {
	const e1 = normal.dot(normal);
	const e2 = normal.dot(clickPoint) - normal.dot(rayStart);
	const e3 = normal.dot(rayDir);

	if (e3 === 0) {
		return -e2 / e1;
	}

	vec1
		.copy(rayDir)
		.multiplyScalar(e1 / e3)
		.sub(normal);
	vec2
		.copy(rayDir)
		.multiplyScalar(e2 / e3)
		.add(rayStart)
		.sub(clickPoint);

	const offset = -vec1.dot(vec2) / vec1.dot(vec1);
	return offset;
};

const upV = /* @__PURE__ */ new THREE.Vector3(0, 1, 0);
const offsetMatrix = /* @__PURE__ */ new THREE.Matrix4();

export const AxisArrow: React.FC<{ direction: THREE.Vector3; axis: 0 | 1 | 2 }> = ({
	direction,
	axis,
}) => {
	const {
		translation,
		translationLimits,
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
		visible,
		onDrag,
		onDragEnd,
		userData,
	} = React.useContext(context);

	const keyModifiers = useModifiers();

	// @ts-expect-error new in @react-three/fiber@7.0.5
	const camControls = useThree((state) => state.controls) as { enabled: boolean };
	const divRef = React.useRef<HTMLDivElement>(null!);
	const objRef = React.useRef<THREE.Group>(null!);
	const clickInfo = React.useRef<{
		clickPoint: THREE.Vector3;
		dir: THREE.Vector3;
	} | null>(null);
	const offset0 = React.useRef<number>(0);
	const [isHovered, setIsHovered] = React.useState(false);
	const [dragOffset, setDragOffset] = React.useState(0);
	const meshRef = React.useRef<THREE.Mesh>(null!);

	const onPointerDown = React.useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			if (annotations) {
				divRef.current.innerText = `${translation.current[axis].toFixed(2)}`;
				divRef.current.style.display = "block";
			}
			e.stopPropagation();
			const rotation = new THREE.Matrix4().extractRotation(objRef.current.matrixWorld);
			const clickPoint = e.point.clone();
			const origin = new THREE.Vector3().setFromMatrixPosition(
				objRef.current.matrixWorld
			);
			const dir = direction.clone().applyMatrix4(rotation).normalize();
			clickInfo.current = { clickPoint, dir };
			offset0.current = translation.current[axis];
			onDragStart({ component: "Arrow", axis, origin, directions: [dir] });
			camControls && (camControls.enabled = false);
			// @ts-ignore - setPointerCapture is not in the type definition
			e.target.setPointerCapture(e.pointerId);
		},
		[annotations, direction, camControls, onDragStart, translation, axis]
	);
	const onPointerMove = React.useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			e.stopPropagation();
			if (!isHovered) setIsHovered(true);

			if (clickInfo.current) {
				const { clickPoint, dir } = clickInfo.current;
				const [min, max] = translationLimits?.[axis] || [undefined, undefined];

				let offset = calculateOffset(clickPoint, dir, e.ray.origin, e.ray.direction);

				//modifier steps
				if (keyModifiers.xx_small_shift[0][0] && keyModifiers.xx_small_shift[0][1]) {
					offset = round(offset, moveModifierIncrement.xx_small_shift, 0);
				} else if (keyModifiers.x_small_shift[0]) {
					offset = round(offset, moveModifierIncrement.x_small_shift, 0);
				} else if (keyModifiers.small_shift[0]) {
					offset = round(offset, moveModifierIncrement.small_shift, 0);
				} else {
					offset = round(offset, 1, 0);
				}

				//
				if (max !== undefined) {
					offset = Math.min(offset, max - offset0.current);
				}
				translation.current[axis] = offset0.current + offset;
				if (annotations) {
					divRef.current.innerText = `${translation.current[axis].toFixed(2)}`;
				}
				offsetMatrix.makeTranslation(dir.x * offset, dir.y * offset, dir.z * offset);
				setDragOffset(offset);
				//console.log("Drag offset: ", dragOffset);
				onDrag(offsetMatrix);
			}
		},
		[annotations, onDrag, isHovered, translation, translationLimits, axis]
	);

	const onPointerUp = React.useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			if (annotations) {
				divRef.current.style.display = "none";
			}
			e.stopPropagation();
			clickInfo.current = null;
			onDragEnd();
			camControls && (camControls.enabled = true);
			// @ts-ignore - releasePointerCapture & PointerEvent#pointerId is not in the type definition
			e.target.releasePointerCapture(e.pointerId);
			setDragOffset(0);
		},
		[annotations, camControls, onDragEnd]
	);

	const onPointerOut = React.useCallback((e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation();
		setIsHovered(false);
	}, []);

	const { cylinderLength, coneWidth, coneLength, matrixL } = React.useMemo(() => {
		const coneWidth = fixed ? (lineWidth / scale) * 1.6 : scale / 20;
		const coneLength = fixed ? 0.2 : scale / 4;
		const cylinderLength = fixed ? 1 - coneLength : scale - coneLength;
		const quaternion = new THREE.Quaternion().setFromUnitVectors(
			upV,
			direction.clone().normalize()
		);
		const matrixL = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
		return { cylinderLength, coneWidth, coneLength, matrixL };
	}, [direction, scale, lineWidth, fixed]);

	const color_ = isHovered ? hoveredColor : axisColors[axis];
	const texture = useLoader(THREE.TextureLoader, icon);
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;

	const axisValToString = (axis: 0 | 1 | 2) => {
		switch (axis) {
			case 0:
				return "X";
			case 1:
				return "Y";
			case 2:
				return "Z";
		}
	};

	//console.log("Axis color:", axisColors[axis].toString());
	//console.log("Darkened color:", darkenColor(axisColors[axis].toString(), 2));

	return (
		<>
			<ambientLight intensity={0.5} />
			<group ref={objRef}>
				<group
					matrix={matrixL}
					matrixAutoUpdate={false}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerOut={onPointerOut}>
					//
					{annotations && (
						<Html position={[0, -coneLength, 0]}>
							<div
								style={{
									display: "none",
									background: "#151520",
									color: "white",
									padding: "6px 8px",
									borderRadius: 7,
									whiteSpace: "nowrap",
								}}
								className={annotationsClass}
								ref={divRef}
							/>
						</Html>
					)}
					{/* The invisible mesh being raycast */}
					<group>
						<mesh
							visible={false}
							position={[0, cylinderLength + coneLength - 0.5, 0]}
							userData={userData}>
							<cylinderGeometry
								args={[
									coneWidth * 1.4,
									coneWidth * 1.4,
									cylinderLength + coneLength,
									8,
									1,
								]}
							/>
						</mesh>
						{/* The visible mesh */}
						<mesh
							raycast={() => null}
							position={[0, scale / 2, 0]}
							renderOrder={1000}
							rotation={[0, Math.PI / 2, 0]}>
							<planeGeometry attach="geometry" args={[scale, scale, scale]} />
							<meshStandardMaterial
								attach="material"
								map={texture}
								depthTest={depthTest}
								transparent={true}
								alphaTest={0.5} // Use alpha of the texture
								side={THREE.DoubleSide} // Render texture on both sides
								color={color_.toString()}
								shadowSide={THREE.DoubleSide}
								toneMapped={false} // Render texture at full brightness
							/>
						</mesh>
						<mesh
							raycast={() => null}
							position={[0, scale / 2, 0]}
							renderOrder={1000}
							rotation={[0, 0, 0]}>
							<planeGeometry attach="geometry" args={[scale, scale, scale]} />
							<meshStandardMaterial
								attach="material"
								map={texture}
								depthTest={depthTest}
								transparent={true}
								alphaTest={0.5} // Use alpha of the texture
								side={THREE.DoubleSide} // Render texture on both sides
								color={color_.toString()}
								shadowSide={THREE.DoubleSide}
								toneMapped={false} // Render texture at full brightness
							/>
						</mesh>

						{/* shows Axis value on hover */}
						<Html position={[0, scale * 1.07, 0]} center>
							<div
								id="test-123"
								aria-busy={(dragOffset != 0).toString()}
								className={
									"aria-busy:w-16 w-8 transition-all ease-in-out duration-75 h-8 p-1 px-2 rounded-md justify-center items-center text-center pointer-events-none select-none"
								}
								style={{
									backgroundColor: axisColors[axis].toString(),
									borderColor: "#" + darkenColor(axisColors[axis].toString(), 0.2),
									borderWidth: "5px",
									display: isHovered && visible ? "block" : "none",
								}}>
								<div className="text-white text-sm w-auto h-full flex justify-center items-center">
									{dragOffset != 0 ? dragOffset.toFixed(2) : axisValToString(axis)}
								</div>
							</div>
						</Html>
					</group>
				</group>
			</group>
		</>
	);
};

import * as React from 'react';
import * as THREE from 'three';
import { ThreeEvent, useThree } from '@react-three/fiber';

import { Html } from '@react-three/drei';
import { context } from './context';
import { calculateScaleFactor } from '@react-three/drei/core/calculateScaleFactor';
import { Canvas, useLoader } from '@react-three/fiber';
import icon from '../../../assets/dot.png';

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

	vec1.copy(rayDir)
		.multiplyScalar(e1 / e3)
		.sub(normal);
	vec2.copy(rayDir)
		.multiplyScalar(e2 / e3)
		.add(rayStart)
		.sub(clickPoint);

	const offset = -vec1.dot(vec2) / vec1.dot(vec1);
	return offset;
};

const upV = /* @__PURE__ */ new THREE.Vector3(0, 1, 0);
const scaleV = /* @__PURE__ */ new THREE.Vector3();
const scaleMatrix = /* @__PURE__ */ new THREE.Matrix4();

export const ScalingSphere: React.FC<{
	direction: THREE.Vector3;
	axis: 0 | 1 | 2;
}> = ({ direction, axis }) => {
	const {
		scaleLimits,
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

	const size = useThree((state) => state.size);
	// @ts-expect-error new in @react-three/fiber@7.0.5
	const camControls = useThree((state) => state.controls) as {
		enabled: boolean;
	};
	const divRef = React.useRef<HTMLDivElement>(null!);
	const objRef = React.useRef<THREE.Group>(null!);
	const meshRef = React.useRef<THREE.Mesh>(null!);
	const scale0 = React.useRef<number>(1);
	const scaleCur = React.useRef<number>(1);
	const clickInfo = React.useRef<{
		clickPoint: THREE.Vector3;
		dir: THREE.Vector3;
		mPLG: THREE.Matrix4;
		mPLGInv: THREE.Matrix4;
		offsetMultiplier: number;
	} | null>(null);
	const [isHovered, setIsHovered] = React.useState(false);

	const position = fixed ? 1.2 : 1.2 * scale;
	const color_ = isHovered ? hoveredColor : axisColors[axis];
	const texture = useLoader(THREE.TextureLoader, icon);
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;

	const onPointerDown = React.useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			if (annotations) {
				divRef.current.innerText = `${scaleCur.current.toFixed(2)}`;
				divRef.current.style.display = 'block';
			}
			e.stopPropagation();
			const rotation = new THREE.Matrix4().extractRotation(
				objRef.current.matrixWorld
			);
			const clickPoint = e.point.clone();
			const origin = new THREE.Vector3().setFromMatrixPosition(
				objRef.current.matrixWorld
			);
			const dir = direction.clone().applyMatrix4(rotation).normalize();
			const mPLG = objRef.current.matrixWorld.clone();
			const mPLGInv = mPLG.clone().invert();
			const offsetMultiplier = fixed
				? 1 /
					calculateScaleFactor(
						objRef.current.getWorldPosition(vec1),
						scale,
						e.camera,
						size
					)
				: 1;
			clickInfo.current = {
				clickPoint,
				dir,
				mPLG,
				mPLGInv,
				offsetMultiplier,
			};
			onDragStart({
				component: 'Sphere',
				axis,
				origin,
				directions: [dir],
			});
			camControls && (camControls.enabled = false);
			// @ts-ignore - setPointerCapture is not in the type definition
			e.target.setPointerCapture(e.pointerId);
		},
		[
			annotations,
			camControls,
			direction,
			onDragStart,
			axis,
			fixed,
			scale,
			size,
		]
	);

	const onPointerMove = React.useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			e.stopPropagation();
			if (!isHovered) setIsHovered(true);
			if (clickInfo.current) {
				const { clickPoint, dir, mPLG, mPLGInv, offsetMultiplier } =
					clickInfo.current;
				const [min, max] = scaleLimits?.[axis] || [1e-5, undefined]; // always limit the minimal value, since setting it very low might break the transform
				const offsetW = calculateOffset(
					clickPoint,
					dir,
					e.ray.origin,
					e.ray.direction
				);
				
				const offsetL = offsetW * offsetMultiplier;
				const offsetH = fixed ? offsetL : offsetL / scale;
				let newSize = Math.pow(2, offsetH * 0.2);
				newSize = Math.max(newSize, min / scale0.current);
				if (max !== undefined) {
					newSize = Math.min(newSize, max / scale0.current);
				}
				scaleCur.current = scale0.current * newSize;
				meshRef.current.position.set(0, position + offsetL, 0);
				if (annotations) {
					divRef.current.innerText = `${scaleCur.current.toFixed(2)}`;
				}
				scaleV.set(1, 1, 1);
				scaleV.setComponent(axis, newSize);
				scaleMatrix
					.identity()
					.scale(scaleV)
					.premultiply(mPLG)
					.multiply(mPLGInv);
				onDrag(scaleMatrix);
			}
		},
		[annotations, position, onDrag, isHovered, scaleLimits, axis]
	);

	const onPointerUp = React.useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			if (annotations) {
				divRef.current.style.display = 'none';
			}
			e.stopPropagation();
			scale0.current = scaleCur.current;
			clickInfo.current = null;
			meshRef.current.position.set(0, position, 0);
			onDragEnd();
			camControls && (camControls.enabled = true);
			// @ts-ignore - releasePointerCapture & PointerEvent#pointerId is not in the type definition
			e.target.releasePointerCapture(e.pointerId);
		},
		[annotations, camControls, onDragEnd, position]
	);

	const onPointerOut = React.useCallback((e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation();
		setIsHovered(false);
	}, []);

	const { objScale, matrixL } = React.useMemo(() => {
		const objScale = scale;
		const quaternion = new THREE.Quaternion().setFromUnitVectors(
			upV,
			direction.clone().normalize()
		);
		const matrixL = new THREE.Matrix4().makeRotationFromQuaternion(
			quaternion
		);
		console.log('radius from scaling sphere', objScale);
		return { objScale, matrixL };
	}, [direction, scale, lineWidth, fixed]);

	const axisValToString = (axis: 0 | 1 | 2) => {
		switch (axis) {
			case 0:
				return 'X';
			case 1:
				return 'Y';
			case 2:
				return 'Z';
		}
	};

	return (
		<group ref={objRef}>
			<group
				scale={objScale}
				matrix={matrixL}
				matrixAutoUpdate={false}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerOut={onPointerOut}
			>
				<mesh
					raycast={() => null}
					position={[0, position, 0]}
					renderOrder={1000}
					rotation={[0, Math.PI / 2, 0]}
				>
					<planeGeometry
						attach="geometry"
						args={[scale, scale, scale]}
					/>
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
					position={[0, position, 0]}
					renderOrder={1000}
					rotation={[0, 0, 0]}
				>
					<planeGeometry
						attach="geometry"
						args={[scale, scale, scale]}
					/>
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
					ref={meshRef}
					position={[0, position, 0]}
					renderOrder={500}
					userData={userData}
				>
					<sphereGeometry args={[scale / 15, 12, 12]} />
					<meshBasicMaterial
						transparent
						visible={false}
						depthTest={depthTest}
						opacity={opacity}
						polygonOffset
						polygonOffsetFactor={-10}
					/>
				</mesh>
			</group>
		</group>
	);
};

import { useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";

import { ForwardRefComponent } from "@react-three/drei/helpers/ts-utils";
import { AxisArrow } from "./AxisArrow";
import { AxisRotator } from "./AxisRotator";
import { PlaneSlider } from "./PlaneSlider";
import { ScalingSphere } from "./ScalingSphere";
import { OnDragStartProps, context } from "./context";
import { calculateScaleFactor } from "@react-three/drei/core/calculateScaleFactor";
import { useViewportSelector } from "../../../hooks/useRedux";

const mL0 = /* @__PURE__ */ new THREE.Matrix4();
const mW0 = /* @__PURE__ */ new THREE.Matrix4();
const mP = /* @__PURE__ */ new THREE.Matrix4();
const mPInv = /* @__PURE__ */ new THREE.Matrix4();
const mW = /* @__PURE__ */ new THREE.Matrix4();
const mL = /* @__PURE__ */ new THREE.Matrix4();
const mL0Inv = /* @__PURE__ */ new THREE.Matrix4();
const mdL = /* @__PURE__ */ new THREE.Matrix4();
const mG = /* @__PURE__ */ new THREE.Matrix4();

const bb = /* @__PURE__ */ new THREE.Box3();
const bbObj = /* @__PURE__ */ new THREE.Box3();
const vCenter = /* @__PURE__ */ new THREE.Vector3();
const vSize = /* @__PURE__ */ new THREE.Vector3();
const vAnchorOffset = /* @__PURE__ */ new THREE.Vector3();
const vPosition = /* @__PURE__ */ new THREE.Vector3();
const vScale = /* @__PURE__ */ new THREE.Vector3();

const xDir = /* @__PURE__ */ new THREE.Vector3(1, 0, 0);
const yDir = /* @__PURE__ */ new THREE.Vector3(0, 1, 0);
const zDir = /* @__PURE__ */ new THREE.Vector3(0, 0, 1);

type PivotControlsProps = {
	/** Enables/disables the control, true */
	enabled?: boolean;
	/** Scale of the gizmo, 1 */
	scale?: number;
	/** Width of the gizmo lines, this is a THREE.Line2 prop, 2.5 */
	lineWidth?: number;
	/** If fixed is true is remains constant in size, scale is now in pixels, false */
	fixed?: boolean;
	/** Pivot does not act as a group, it won't shift contents but can offset in position */
	offset?: [number, number, number];
	/** Starting rotation */
	rotation?: [number, number, number];

	/** Starting matrix */
	matrix?: THREE.Matrix4;
	/** BBAnchor, each axis can be between -1/0/+1 */
	anchor?: [number, number, number];
	/** If autoTransform is true, automatically apply the local transform on drag, true */
	autoTransform?: boolean;
	/** Allows you to switch individual axes off */
	activeAxes?: [boolean, boolean, boolean];

	/** Allows you to switch individual transformations off */
	disableAxes?: boolean;
	disableSliders?: boolean;
	disableRotations?: boolean;
	disableScaling?: boolean;

	/** Limits */
	translationLimits?: [
		[number, number] | undefined,
		[number, number] | undefined,
		[number, number] | undefined
	];
	rotationLimits?: [
		[number, number] | undefined,
		[number, number] | undefined,
		[number, number] | undefined
	];
	scaleLimits?: [
		[number, number] | undefined,
		[number, number] | undefined,
		[number, number] | undefined
	];

	/** RGB colors */
	axisColors?: [string | number, string | number, string | number];
	/** Color of the hovered item */
	hoveredColor?: string | number;
	/** HTML value annotations, default: false */
	annotations?: boolean;
	/** CSS Classname applied to the HTML annotations */
	annotationsClass?: string;
	/** Drag start event */
	onDragStart?: (props: OnDragStartProps) => void;
	/** Drag event */
	onDrag?: (
		l: THREE.Matrix4,
		deltaL: THREE.Matrix4,
		w: THREE.Matrix4,
		deltaW: THREE.Matrix4
	) => void;
	/** Drag end event */
	onDragEnd?: () => void;
	/** Set this to false if you want the gizmo to be visible through faces */
	depthTest?: boolean;
	opacity?: number;
	visible?: boolean;
	userData?: { [key: string]: any };
	children?: React.ReactNode;
};

export const PivotControls: ForwardRefComponent<PivotControlsProps, THREE.Group> =
	/* @__PURE__ */ React.forwardRef<THREE.Group, PivotControlsProps>(
		(
			{
				enabled = true,
				matrix,
				onDragStart,
				onDrag,
				onDragEnd,
				autoTransform = true,
				anchor,
				disableAxes = false,
				disableSliders = false,
				disableRotations = false,
				disableScaling = false,
				activeAxes = [true, true, true],
				offset = [0, 0, 0],
				rotation = [0, 0, 0],
				scale = 1,
				lineWidth = 10,
				fixed = false,
				translationLimits,
				rotationLimits,
				scaleLimits,
				depthTest = true,
				axisColors = ["#ff2060", "#20df80", "#2080ff"],
				hoveredColor = "#ffff40",
				annotations = false,
				annotationsClass,
				opacity = 1,
				visible = true,
				userData,
				children,
				...props
			},
			fRef
		) => {
			const invalidate = useThree((state) => state.invalidate);
			const parentRef = React.useRef<THREE.Group>(null!);
			const ref = React.useRef<THREE.Group>(null!);
			const gizmoRef = React.useRef<THREE.Group>(null!);
			const childrenRef = React.useRef<THREE.Group>(null!);
			const translation = React.useRef<[number, number, number]>([0, 0, 0]);
			const cameraScale = React.useRef<THREE.Vector3>(new THREE.Vector3(1, 1, 1));
			const gizmoScale = React.useRef<THREE.Vector3>(new THREE.Vector3(1, 1, 1));
			const selectedRef = React.useRef<number>(useViewportSelector().selected ?? -1);
			const selected = selectedRef.current;

			React.useLayoutEffect(() => {
				if (!anchor) return;
				childrenRef.current.updateWorldMatrix(true, true);

				mPInv.copy(childrenRef.current.matrixWorld).invert();
				bb.makeEmpty();
				childrenRef.current.traverse((obj: any) => {
					if (!obj.geometry) return;
					if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
					mL.copy(obj.matrixWorld).premultiply(mPInv);
					bbObj.copy(obj.geometry.boundingBox);
					bbObj.applyMatrix4(mL);
					bb.union(bbObj);
				});
				vCenter.copy(bb.max).add(bb.min).multiplyScalar(0.5);
				vSize.copy(bb.max).sub(bb.min).multiplyScalar(0.5);
				vAnchorOffset
					.copy(vSize)
					.multiply(new THREE.Vector3(...anchor))
					.add(vCenter);
				vPosition.set(...offset).add(vAnchorOffset);
				gizmoRef.current.position.copy(vPosition);
				invalidate();
			});

			const config = React.useMemo(
				() => ({
					onDragStart: (props: OnDragStartProps) => {
						mL0.copy(ref.current.matrix);
						mW0.copy(ref.current.matrixWorld);
						onDragStart && onDragStart(props);
						invalidate();
					},
					onDrag: (mdW: THREE.Matrix4) => {
						mP.copy(parentRef.current.matrixWorld);
						mPInv.copy(mP).invert();
						// After applying the delta
						mW.copy(mW0).premultiply(mdW);
						mL.copy(mW).premultiply(mPInv);
						mL0Inv.copy(mL0).invert();
						mdL.copy(mL).multiply(mL0Inv);
						if (autoTransform) {
							ref.current.matrix.copy(mL);
						}
						onDrag && onDrag(mL, mdL, mW, mdW);
						invalidate();
					},
					onDragEnd: () => {
						if (autoTransform) {
							ref.current.updateMatrixWorld();
						}
						if (onDragEnd) onDragEnd();
						invalidate();
					},
					translation,
					translationLimits,
					rotationLimits,
					axisColors,
					hoveredColor,
					opacity,
					scale,
					lineWidth,
					visible,
					fixed,
					depthTest,
					userData,
					annotations,
					annotationsClass,
				}),
				[
					onDragStart,
					onDrag,
					onDragEnd,
					translation,
					translationLimits,
					rotationLimits,
					scaleLimits,
					depthTest,
					scale,
					lineWidth,
					fixed,
					...axisColors,
					hoveredColor,
					opacity,
					userData,
					autoTransform,
					annotations,
					annotationsClass,
				]
			);

			const vec = new THREE.Vector3();
			useFrame((state) => {
				if (fixed) {
					const sf = calculateScaleFactor(
						gizmoRef.current.getWorldPosition(vec),
						scale,
						state.camera,
						state.size
					);
					cameraScale.current.setScalar(sf);
				}

				if (matrix && matrix instanceof THREE.Matrix4) {
					ref.current.matrix = matrix;
				}
				// Update gizmo scale in accordance with matrix changes
				// Without this, there might be noticable turbulences if scaling happens fast enough
				ref.current.updateWorldMatrix(true, true);

				mG.makeRotationFromEuler(gizmoRef.current.rotation)
					.setPosition(gizmoRef.current.position)
					.premultiply(ref.current.matrixWorld);
				gizmoScale.current.setFromMatrixScale(mG);

				vScale.copy(cameraScale.current).divide(gizmoScale.current);
				if (
					Math.abs(gizmoRef.current.scale.x - vScale.x) > 1e-4 ||
					Math.abs(gizmoRef.current.scale.y - vScale.y) > 1e-4 ||
					Math.abs(gizmoRef.current.scale.z - vScale.z) > 1e-4
				) {
					gizmoRef.current.scale.copy(vScale);
					state.invalidate();
				}

				const distance = state.camera.position.distanceTo(gizmoRef.current.position);
				const scaleFactor = (distance / (state.size.height / 2)) * 100; // Adjust the divisor to control the size
				gizmoRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);

				if (selectedRef.current === -1) {
					gizmoRef.current.visible = false;
					enabled = false;
				} else {
					gizmoRef.current.visible = true;
					enabled = true;
				}
			});

			React.useImperativeHandle(fRef, () => ref.current, []);

			return (
				<context.Provider value={config}>
					<group ref={parentRef}>
						<group ref={ref} matrix={matrix} matrixAutoUpdate={false} {...props}>
							<group
								visible={visible}
								ref={gizmoRef}
								position={offset}
								rotation={rotation}>
								{enabled && (
									<>
										{!disableAxes && activeAxes[0] && (
											<AxisArrow axis={0} direction={xDir} />
										)}
										{!disableAxes && activeAxes[1] && (
											<AxisArrow axis={1} direction={yDir} />
										)}
										{!disableAxes && activeAxes[2] && (
											<AxisArrow axis={2} direction={zDir} />
										)}
										{!disableSliders && activeAxes[0] && activeAxes[1] && (
											<PlaneSlider axis={2} dir1={xDir} dir2={yDir} />
										)}
										{!disableSliders && activeAxes[0] && activeAxes[2] && (
											<PlaneSlider axis={1} dir1={zDir} dir2={xDir} />
										)}
										{!disableSliders && activeAxes[2] && activeAxes[1] && (
											<PlaneSlider axis={0} dir1={yDir} dir2={zDir} />
										)}
										{!disableRotations && activeAxes[0] && activeAxes[1] && (
											<AxisRotator axis={2} dir1={xDir} dir2={yDir} />
										)}
										{!disableRotations && activeAxes[0] && activeAxes[2] && (
											<AxisRotator axis={1} dir1={zDir} dir2={xDir} />
										)}
										{!disableRotations && activeAxes[2] && activeAxes[1] && (
											<AxisRotator axis={0} dir1={yDir} dir2={zDir} />
										)}
										{!disableScaling && activeAxes[0] && (
											<ScalingSphere axis={0} direction={xDir} />
										)}
										{!disableScaling && activeAxes[1] && (
											<ScalingSphere axis={1} direction={yDir} />
										)}
										{!disableScaling && activeAxes[2] && (
											<ScalingSphere axis={2} direction={zDir} />
										)}
									</>
								)}
							</group>
							<group ref={childrenRef}>{children}</group>
						</group>
					</group>
				</context.Provider>
			);
		}
	);

export const onDragStart = (
	props: OnDragStartProps,
	boxRef2: React.RefObject<THREE.Mesh>,
	useGimbal: [boolean, React.Dispatch<React.SetStateAction<boolean>>],
	invalidate: React.MutableRefObject<(arg0: number) => void>,
	preMatrix: THREE.Matrix4
) => {
	useGimbal[1](false);
	invalidate.current(1);
	preMatrix.copy(boxRef2.current.matrix);
};

export const onDrag = (
	l: THREE.Matrix4,
	deltaL: THREE.Matrix4,
	w: THREE.Matrix4,
	deltaW: THREE.Matrix4,
	boxRef2: React.RefObject<THREE.Mesh>,
	invalidate: React.MutableRefObject<(arg0: number) => void>,
	preMatrix: THREE.Matrix4
) => {
	const translationScale = 0.1; // Adjust this value to control the movement scale
	var pivotMatrix = new THREE.Matrix4();
	pivotMatrix
		.copy(preMatrix)
		.multiply(
			new THREE.Matrix4().makeTranslation(
				deltaL.elements[12] * translationScale,
				deltaL.elements[13] * translationScale,
				deltaL.elements[14] * translationScale
			)
		);
	if (boxRef2.current) {
		boxRef2.current.matrix.copy(pivotMatrix);
		boxRef2.current.matrix.decompose(
			boxRef2.current.position,
			boxRef2.current.quaternion,
			boxRef2.current.scale
		);
	}
	invalidate.current();
};

export const onDragEnd = (
	boxRef2: React.RefObject<THREE.Mesh>,
	useGimbal: [boolean, React.Dispatch<React.SetStateAction<boolean>>],
	invalidate: React.MutableRefObject<(arg0: number) => void>
) => {
	useGimbal[1](true);
	if (boxRef2.current) {
		boxRef2.current.updateMatrixWorld();
	}
	invalidate.current(10);
};

export const preMatrix = new THREE.Matrix4();
export const preMatrixInv = new THREE.Matrix4();

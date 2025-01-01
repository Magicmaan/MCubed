import * as React from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent, invalidate } from "@react-three/fiber";
import {
	useAppDispatch,
	useMeshSelector,
	useViewportSelector,
} from "../../hooks/useRedux";
import { setSelected as reduxSetSelected } from "../../reducers/viewportReducer";
import { CubeProps } from "../../primitives/Cube";
import { loadTexture } from "../../util/textureUtil";
import { InstancedUniformsMesh } from "three-instanced-uniforms-mesh";
import { Line, Outlines, Select, useTexture, Wireframe } from "@react-three/drei";
import { uv } from "three/webgpu";
import { meshModifyIndex } from "../../reducers/meshReducer";

const ModelInstance: React.FC<{
	count: number;
	temp?: THREE.Object3D;
	modelData: CubeProps[];
	selectRef: React.RefObject<THREE.Mesh | null>;
	setPivotPosition: (position: THREE.Vector3) => void;
}> = ({
	count = 20,
	temp = new THREE.Object3D(),
	modelData: modelDataIn,
	selectRef,
	setPivotPosition,
}) => {
	const model = useMeshSelector();
	const modelData = React.useMemo(() => model.mesh, [model]);

	const selectedID = React.useRef<number | null>(null);
	const instancedMeshRef = React.useRef(null);
	const boxRef = React.useRef<THREE.BoxGeometry>(null);
	const dispatch = useAppDispatch();
	//TODO, switch to dataURL
	const textures = React.useMemo(
		() => [
			loadTexture("/src/assets/textures/s3.png"),
			loadTexture("/src/assets/textures/s2.png"),
			loadTexture("/src/assets/textures/s5.png"), //up
			loadTexture("/src/assets/textures/s4.png"), //down
			loadTexture("/src/assets/textures/s1.png"),
			loadTexture("/src/assets/textures/s6.png"),
			loadTexture("/src/assets/textures/UV.png"),
		],
		[]
	);

	const materials = React.useMemo(
		() => [
			new THREE.MeshBasicMaterial({ map: textures[0] }),
			new THREE.MeshBasicMaterial({ map: textures[1] }),
			new THREE.MeshBasicMaterial({ map: textures[2] }),
			new THREE.MeshBasicMaterial({ map: textures[3] }),
			new THREE.MeshBasicMaterial({ map: textures[4] }),
			new THREE.MeshBasicMaterial({ map: textures[5] }),

			new THREE.MeshBasicMaterial({ map: textures[6] }), // UV map
		],
		[textures]
	);

	const handleClick = (event: ThreeEvent<MouseEvent>) => {
		console.log("Click");
		//console.log(event.eventObject.userData.id);
		//const instanceId = event.eventObject.userData.id;
		if (instanceId !== undefined) {
			//console.log(`Cube ${instanceId} clicked`);
			dispatch(reduxSetSelected(instanceId));
			selectedID.current = instanceId;
			event.eventObject.matrixWorld.copy(selectRef.current?.matrixWorld as THREE.Matrix4);
			event.eventObject.updateMatrixWorld();
			const position = new THREE.Vector3(
				modelData[instanceId].position[0],
				modelData[instanceId].position[1],
				modelData[instanceId].position[2]
			);
			//setPivotPosition(position);
		}
	};

	const isjustSelected = React.useRef(false);
	useFrame(() => {
		for (let i = 0; i < count; i++) {
			const mesh = modelData[i];
			if (selectedID.current === i) {
				// on first frame of selection
				if (!isjustSelected.current) {
					isjustSelected.current = true;
					//console.log("Selected", i);
				}
				if (selectRef.current?.matrixWorld) {
					selectRef.current?.matrixWorld.decompose(
						temp.position,
						temp.quaternion,
						temp.scale
					);
				}
				temp.scale.set(
					mesh.size[0] * mesh.scale,
					mesh.size[1] * mesh.scale,
					mesh.size[2] * mesh.scale
				);
				temp.updateMatrix();
				selectRef.current?.updateMatrixWorld();
				instancedMeshRef.current?.setMatrixAt(i, temp.matrix);

				console.log("buh");
				console.log(instancedMeshRef.current);
			}
		}
		//console.log("instance", boxRef.current);
		if (instancedMeshRef.current) {
			instancedMeshRef.current.instanceMatrix.needsUpdate = true;
		}
	});

	//load model data into matrix positions
	React.useEffect(() => {
		// Set positions
		for (let i = 0; i < count; i++) {
			temp.position.set(
				modelData[i].position[0],
				modelData[i].position[1],
				modelData[i].position[2]
			);
			temp.rotation.set(
				modelData[i].rotation[0],
				modelData[i].rotation[1],
				modelData[i].rotation[2]
			);
			temp.scale.set(
				modelData[i].size[0] * modelData[i].scale,
				modelData[i].size[1] * modelData[i].scale,
				modelData[i].size[2] * modelData[i].scale
			);
			temp.updateMatrix();
			instancedMeshRef.current?.setMatrixAt(i, temp.matrix);
		}
		const val = 1 / (materials[0].map?.image.width / temp.scale.x);
		const testUV = new THREE.Float32BufferAttribute(
			[
				1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1,
				0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0,
			],
			2,
			false
		);

		if (instancedMeshRef.current) {
			instancedMeshRef.current.instanceMatrix.needsUpdate = true;
		}
		//console.log(instancedMeshRef.current?.material);
	}, []);

	const mate = useTexture("/src/assets/textures/UV.png");

	return (
		<>
			{modelData.map((cube, index) => (
				<Cube
					cube={cube as CubeProps}
					index={index}
					handleClick={handleClick}
					texture={textures[6]}
					selectRef={selectRef}
				/>
			))}
		</>
	);
};

const Cube: React.FC<{
	cube: CubeProps;
	index: number;
	texture: THREE.Texture;
	selectRef: React.RefObject<THREE.Mesh | null>;
}> = ({ cube, index, texture, selectRef }) => {
	const ref = React.useRef<THREE.Mesh>(null);
	const selected = React.useRef(false);
	const dispatch = useAppDispatch();
	const currentSelected = useViewportSelector();

	const isMouseDown = React.useRef(false);
	const isMouseSelected = React.useRef(false);

	const originalUV = new Float32Array([
		0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0,
		0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0,
	]);

	console.log("texture json", texture);

	useFrame(() => {
		if (ref.current?.userData.id == currentSelected.selected) {
			selected.current = true;
		} else {
			selected.current = false;
		}

		if (selected.current) {
			//console.log("Selected", cube.id);
			ref.current?.matrixWorld.copy(selectRef.current?.matrixWorld as THREE.Matrix4);
			ref.current?.matrixWorld.decompose(
				ref.current.position,
				ref.current.quaternion,
				ref.current.scale
			);
			// if (ref.current?.position.toArray() !== cube.position) {
			// 	dispatch(
			// 		meshModifyIndex({ index: cube.id, position: ref.current?.position.toArray() })
			// 	);
			// }
			invalidate();
		}
		ref.current?.geometry.setAttribute(
			"uv",
			new THREE.Float32BufferAttribute(unpackCubePropsUV(cube), 2)
		);

		ref.current?.updateMatrixWorld();
		ref.current?.updateMatrix();
	});

	const onUpdate = React.useCallback((self) => {
		//on props update, make sure uv is updated
		self.geometry.setAttribute(
			"uv",
			new THREE.Float32BufferAttribute(unpackCubePropsUV(cube), 2)
		);
	}, []);
	const setSelected = React.useCallback((event: ThreeEvent<MouseEvent>) => {
		const instanceId = event.eventObject.userData.id;
		if (selected.current) {
			selected.current = false;
			console.log("Deselected", cube.id);
			console.log("Current selected", currentSelected.selected);

			if (instanceId === currentSelected.selected) {
				dispatch(reduxSetSelected(-1));
			}
		}
		if (instanceId !== undefined) {
			console.log(`Cube ${instanceId} clicked`);
			dispatch(reduxSetSelected(instanceId));
			selected.current = true;
			invalidate();
		}
	}, []);

	return (
		<mesh
			onUpdate={onUpdate}
			onContextMenu={(e) => {
				console.log("Context Menu");
			}}
			ref={ref}
			key={index}
			position={cube.position}
			rotation={cube.rotation}
			scale={cube.scale}
			onPointerDown={(e) => {
				isMouseDown.current = true;
			}}
			onPointerLeave={(e) => {
				isMouseDown.current = false;
			}}
			onClick={(e) => {
				if (isMouseDown.current) {
					setSelected(e);
				}
			}}
			userData={{ id: cube.id }}>
			<boxGeometry args={[cube.size[0], cube.size[1], cube.size[2]]} attach="geometry" />
			<meshBasicMaterial map={texture} attach="material" transparent={true} />

			{/* <boxGeometry args={[cube.size[0], cube.size[1], cube.size[2]]} attach="geometry" /> */}

			<Outlines
				name="outline"
				color="#ffffff"
				opacity={1}
				transparent={true}
				thickness={0.01}
				scale={1.05}
				visible={selected.current}
				renderOrder={1}
				userData={{ type: "outline" }}
			/>
		</mesh>
	);
};

const uvOffsets = {
	front: 0,
	back: 8,
	top: 16,
	bottom: 24,
	left: 32,
	right: 40,
};

const unpackCubePropsUV = (cube: CubeProps) => {
	const uv = new Float32Array(48);
	const convertToTrianglePositions = (uvCoords: number[]) => {
		const [x1, y1, x2, y2] = uvCoords;
		return [
			x1,
			1 - y1,
			x2,
			1 - y1,
			x1,
			1 - y2,
			x2,
			1 - y2, // Adjusted vertices
		];
	};
	uv.set(convertToTrianglePositions(cube.uv.left), 0);
	uv.set(convertToTrianglePositions(cube.uv.right), 8);
	uv.set(convertToTrianglePositions(cube.uv.top), 16);
	uv.set(convertToTrianglePositions(cube.uv.bottom), 24);
	uv.set(convertToTrianglePositions(cube.uv.front), 32);
	uv.set(convertToTrianglePositions(cube.uv?.back), 40);
	return uv;
};

const uvToFaces = (uv: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) => {
	const intFace = {
		0: "top",
		1: "bottom",
		2: "left",
		3: "right",
		4: "front",
		5: "back",
	};
	const faces: { [key: string]: Float32Array } = {
		top: new Float32Array(8),
		bottom: new Float32Array(8),
		left: new Float32Array(8),
		right: new Float32Array(8),
		front: new Float32Array(8),
		back: new Float32Array(8),
	};
	const stridePerVec = uv.itemSize;
	const stridePerFace = stridePerVec * 4;
	let currentFaceint = 0;
	let currentFace: string;

	for (currentFaceint = 0; currentFaceint < 6; currentFaceint++) {
		currentFace = intFace[currentFaceint];
		// start end offsets, 0-8 8-16 16-24 24-32 32-40 40-48
		const start = currentFaceint * stridePerFace;
		const end = start + stridePerFace;

		// place into faces array
		faces[currentFace].set(uv.array.slice(start, end), 0);
	}
	console.log("to Faces", faces);
	return faces;
};

const facesToUV = (faces: { [key: string]: Float32Array }) => {
	const uv = new Float32Array(48);
	let offset = 0;
	for (const face in faces) {
		const faceUV = faces[face];
		uv.set(faceUV, offset);
		offset += faceUV.length;
	}
	console.log("to UV", uv);
	return uv;
};

const setUVFace = (
	uv: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
	face: number,
	uvData: number[]
) => {
	const stride = face * 4;
	uv.setXY(stride, uvData[0], uvData[1]);
	uv.setXY(stride + 1, uvData[2], uvData[3]);
	uv.setXY(stride + 2, uvData[4], uvData[5]);
	uv.setXY(stride + 3, uvData[6], uvData[7]);
};

const getTextureUV = (
	texture: THREE.Texture,
	xyPixel: [number, number],
	size: [number, number]
) => {
	const width = texture.image.width;
	const height = texture.image.height;
	const xyUV = [xyPixel[0] / width, xyPixel[1] / height];
	const sizeUV = [size[0] / width, size[1] / height];

	const uv = new Float32Array([
		0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0,
		0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0,
	]);
	return uv;
};

export default ModelInstance;

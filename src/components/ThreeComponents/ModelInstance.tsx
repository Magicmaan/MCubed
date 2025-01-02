import * as React from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent, invalidate } from "@react-three/fiber";
import {
	useAppDispatch,
	useMeshDataSelector,
	useMeshStoreSelector,
	useViewportCameraSelector,
	useViewportCameraSettingsSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from "../../hooks/useRedux";
import { setSelected as reduxSetSelected } from "../../reducers/viewportReducer";
import { CubeProps } from "../../primitives/Cube";
import { loadTexture, boxUVToVertexArray } from "../../util/textureUtil";
import { InstancedUniformsMesh } from "three-instanced-uniforms-mesh";
import { Line, Outlines, Select, useTexture, Wireframe } from "@react-three/drei";
import { uv } from "three/webgpu";
import { meshModifyIndex } from "../../reducers/meshReducer";

const ModelInstance: React.FC<{
	selectionAnchorRef: React.MutableRefObject<THREE.Group<THREE.Object3DEventMap> | null>;
}> = ({ selectionAnchorRef }) => {
	const model = useMeshStoreSelector();
	const modelData = useMeshDataSelector();

	const meshData = useMeshDataSelector();
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
		// ...existing code...
	};

	const isjustSelected = React.useRef(false);
	useFrame(() => {
		// ...existing code...
	});

	//load model data into matrix positions
	React.useEffect(() => {
		// ...existing code...
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
					selectionAnchorRef={selectionAnchorRef}
				/>
			))}
		</>
	);
};

const Cube: React.FC<{
	cube: CubeProps;
	index: number;
	texture: THREE.Texture;
	selectionAnchorRef: React.RefObject<THREE.Mesh | null>;
}> = ({ cube, index, texture, selectionAnchorRef }) => {
	const ref = React.useRef<THREE.Mesh>(null);
	const selectedID = useViewportSelectedSelector();
	const selectedIDRef = React.useRef(useViewportSelectedSelector());
	const outlineVisible = React.useRef(false);
	const selected = React.useRef(false);

	React.useEffect(() => {
		console.log("selected changed CUBE", selectedID);
		if (selectedID === -1 || selectedID === undefined) {
			selected.current = false;
			outlineVisible.current = false;
		} else if (selectedID === cube.id) {
			selected.current = true;
			outlineVisible.current = true;
		}
		invalidate();
	}, [selectedID]);

	const dispatch = useAppDispatch();
	const viewport = useViewportSelector();
	const clickTimer = React.useRef<number>(0);
	const isMouseDown = React.useRef(false);
	const cameraControls = useViewportCameraSelector();

	// Update UV coordinates on each frame
	useFrame(() => {
		// Update the cube's position and scale if selected
		if (selected.current) {
			ref.current?.matrixWorld.copy(
				selectionAnchorRef.current?.matrixWorld as THREE.Matrix4
			);
			ref.current?.matrixWorld.decompose(
				ref.current.position,
				ref.current.quaternion,
				ref.current.scale
			);
		}

		// if not using gimbal, update position from store (allows for setting position from outside viewport)
		if (cameraControls?.pan && cameraControls?.rotate && cameraControls?.zoom) {
			const worldPos = new THREE.Vector3(
				cube.position[0],
				cube.position[1],
				cube.position[2]
			);
			ref.current?.position.copy(worldPos);
		}

		ref.current?.updateMatrixWorld();
		ref.current?.updateMatrix();
		invalidate();
	});

	// Update UV coordinates on props update
	const onUpdate = React.useCallback((self: THREE.Mesh) => {
		if (selectedID === cube.id) {
			selected.current = true;
			outlineVisible.current = true;
		} else {
			selected.current = false;
			outlineVisible.current = false;
		}
		updateUV(self);
		self.updateMatrixWorld();
	}, []);

	const updateUV = React.useCallback((self: THREE.Mesh) => {
		if (self === null) return;
		if (cube.uv === undefined) return;

		self.geometry.setAttribute(
			"uv",
			new THREE.Float32BufferAttribute(boxUVToVertexArray(cube.uv), 2)
		);
	}, []);

	// Handle cube selection
	const setSelected = React.useCallback((e: ThreeEvent<MouseEvent>) => {
		if (clickTimer.current && clickTimer.current > 0) {
			clickTimer.current -= 1;
			return;
		}
		if (selected.current) {
			// if already selected, deselect
			if (cube.id === selectedID) {
				dispatch(reduxSetSelected(-1));
			}
			selected.current = false;
			outlineVisible.current = false;
		} else {
			// if not selected, dispatch selected
			if (cube.id !== undefined) {
				dispatch(reduxSetSelected(cube.id));
				selected.current = true;
				outlineVisible.current = true;
			}
		}
		invalidate();
		clickTimer.current = 1;
	}, []);

	return (
		<mesh
			onUpdate={onUpdate}
			ref={ref}
			key={index}
			position={cube.position}
			rotation={cube.rotation}
			scale={cube.scale}
			onPointerDown={setSelected}
			onPointerLeave={() => {
				isMouseDown.current = false;
			}}
			onPointerUp={() => {
				isMouseDown.current = false;
			}}
			onClick={() => {
				if (isMouseDown.current) {
				}
			}}
			userData={{ id: cube.id }}>
			<boxGeometry args={[cube.size[0], cube.size[1], cube.size[2]]} attach="geometry" />
			<meshBasicMaterial map={texture} attach="material" transparent={true} />

			<Outlines
				name="outline"
				color="#ffffff"
				opacity={1}
				onUpdate={(self) => {
					// fixes bug where outline only updates when refreshing full viewport for some reason
					if (selectedID === cube.id) {
						outlineVisible.current = true;
						self.visible = true;
					} else {
						outlineVisible.current = false;
						self.visible = false;
					}
				}}
				transparent={true}
				thickness={0.01}
				scale={1.05}
				visible={outlineVisible.current}
				renderOrder={1}
				userData={{ type: "outline" }}
			/>
		</mesh>
	);
};

export default ModelInstance;

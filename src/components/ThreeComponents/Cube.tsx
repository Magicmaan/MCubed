import * as THREE from 'three';
import * as React from 'react';

import { Outlines } from '@react-three/drei';
import { useFrame, ThreeEvent, invalidate } from '@react-three/fiber';
import {
	useAppDispatch,
	useMeshTextureSelector,
	useViewportCameraSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from '../../hooks/useRedux';
import { setSelected as reduxSetSelected } from '../../reducers/viewportReducer';

import { BoxUVMap, boxUVToVertexArray } from '../../util/textureUtil';
import { useTexture } from '@react-three/drei';

import { CubeProps, THREEObjectProps } from '../../types/three';
import { meshModify } from '../../reducers/meshReducer';

const Cube: React.FC<{
	cube: CubeProps;
	index: number;
	texture: THREE.Texture;
	selectionAnchorRef: React.MutableRefObject<THREE.Group<THREE.Object3DEventMap> | null>;
}> = ({ cube, index, texture: textureIn, selectionAnchorRef }) => {
	const ref = React.useRef<THREE.Mesh>(null);
	const selectedID = useViewportSelectedSelector();
	const textures = useMeshTextureSelector();

	const outlineVisible = React.useRef(false);
	const selected = React.useRef(false);
	const mouseDownPos = React.useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
	const matrixBefore = React.useRef<THREE.Matrix4>(new THREE.Matrix4());

	const texture = useTexture(textures[0].data);
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;

	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;

	React.useEffect(() => {
		if (selectedID !== cube.id) {
			console.log('selected changed to NONE', cube.id);
			selected.current = false;
			outlineVisible.current = false;
			matrixBefore.current =
				ref.current?.matrixWorld.clone() as THREE.Matrix4;

			ref.current?.matrixWorld.copy(
				matrixBefore.current as THREE.Matrix4
			);
			ref.current?.matrixWorld.decompose(
				ref.current.position,
				ref.current.quaternion,
				ref.current.scale
			);
		} else {
			console.log('selected changed to CUBE', selectedID);
			console.log('selected changed to CUBE', cube.name);
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
		if (selectedID === cube.id) {
			ref.current?.matrixWorld.copy(
				selectionAnchorRef.current?.matrixWorld as THREE.Matrix4
			);
			ref.current?.matrixWorld.decompose(
				ref.current.position,
				ref.current.quaternion,
				ref.current.scale
			);
		} else {
			const worldPos = new THREE.Vector3(
				cube.position[0],
				cube.position[1],
				cube.position[2]
			);
			const worldRotation = new THREE.Euler(
				cube.rotation[0],
				cube.rotation[1],
				cube.rotation[2]
			);
			ref.current?.position.copy(worldPos);
			ref.current?.rotation.copy(worldRotation);
			ref.current?.matrixWorld.setPosition(worldPos);
			ref.current?.matrixWorld.makeRotationFromEuler(worldRotation);
			// ref.current?.matrixWorld.decompose(
			// 	ref.current.position,
			// 	ref.current.quaternion,
			// 	ref.current.scale
			// );
			//console.log(cube.name, 'position', ref.current.position);
		}
		// if not using gimbal, update position from store (allows for setting position from outside viewport)
		if (
			(cameraControls?.pan &&
				cameraControls?.rotate &&
				cameraControls?.zoom) ||
			!selected.current
		) {
			const worldPos = new THREE.Vector3(
				cube.position[0],
				cube.position[1],
				cube.position[2]
			);
			ref.current?.position.copy(worldPos);
			ref.current?.matrixWorld.setPosition(worldPos);
		}

		// Update UV coordinates
		ref.current?.geometry.setAttribute(
			'uv',
			new THREE.Float32BufferAttribute(boxUVToVertexArray(cube.uv), 2)
		);

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

	const updateUV = React.useCallback(
		(self: THREE.Mesh) => {
			if (self === null) return;
			if (cube.uv === undefined) return;

			self.geometry.setAttribute(
				'uv',
				new THREE.Float32BufferAttribute(boxUVToVertexArray(cube.uv), 2)
			);
		},
		[cube.uv, cube.auto_uv]
	);

	// Handle cube selection
	const setSelected = React.useCallback((e: ThreeEvent<MouseEvent>) => {
		if (clickTimer.current && clickTimer.current > 0) {
			clickTimer.current -= 1;
			return;
		}
		if (selected.current) {
			// if already selected, deselect
			if (cube.id === selectedID) {
				console.log('Deselected cube', cube.id);
				dispatch(reduxSetSelected(-1));
			}
			selected.current = false;
			outlineVisible.current = false;
		} else {
			// if not selected, dispatch selected
			if (cube.id !== undefined) {
				console.log('Selected cube', cube.id);
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
			onPointerLeave={() => {
				isMouseDown.current = false;
			}}
			onClick={(e) => {
				if (selected.current) {
					if (isMouseDown.current) {
						setSelected(e);
					}
				} else {
					setSelected(e);
				}
				isMouseDown.current = false;
				mouseDownPos.current.set(0, 0);
			}}
			onPointerDown={(e) => {
				mouseDownPos.current.set(e.point.x, e.point.y);
				isMouseDown.current = true;
			}}
			onPointerMove={(e) => {
				if (isMouseDown.current) {
					console.log(' pointer select', e.point.x, e.point.y);
					console.log(
						' pointer select dist',
						e.point.x - mouseDownPos.current.x,
						e.point.y - mouseDownPos.current.y
					);
					if (
						Math.abs(e.point.x - mouseDownPos.current.x) > 20 ||
						Math.abs(e.point.y - mouseDownPos.current.y) > 20
					) {
						isMouseDown.current = false;
					}
				}
			}}
			userData={{ id: cube.id }}
		>
			<boxGeometry
				args={[cube.size[0], cube.size[1], cube.size[2]]}
				attach="geometry"
			/>
			<meshBasicMaterial
				map={texture}
				attach="material"
				transparent={true}
			/>

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
				userData={{ type: 'outline' }}
			/>
		</mesh>
	);
};

type GroupProps = {
	type: 'Group';
	name: string;
	size: [number, number, number];
	position: [number, number, number];
	rotation: [number, number, number];
	scale: number;
	pivot: [number, number, number];
	id: number;

	children: CubeProps[] | GroupProps[];
};

// returns an array representing cube data
export default Cube;
export type { GroupProps };

import * as THREE from 'three';
import * as React from 'react';
import { useFrame, ThreeEvent, invalidate, useThree } from '@react-three/fiber';
import { Html, useTexture, Wireframe } from '@react-three/drei';
import {
	useAppDispatch,
	useMeshTextureSelector,
	useViewportCameraSelector,
	useViewportSelectedSelector,
	useViewportSelector,
} from '../../hooks/useRedux';
import { setControls, setSelected } from '../../redux/reducers/viewportReducer';
import { BoxUVMap, boxUVToVertexArray } from '../../util/textureUtil';
import {
	CubeProps,
	THREEObjectProps,
	THREETextureProps,
} from '../../types/three';
import { meshModifyID, meshRemoveCube } from '../../redux/reducers/meshReducer';
import {
	Menu,
	Item,
	Separator,
	Submenu,
	useContextMenu,
} from 'react-contexify';
import { ContextInfoItem } from '../templates/ContextMenu';
import { Button } from './ui/button';
import { useKey } from 'react-use';

const Cube: React.FC<{
	cube: CubeProps;
	index: number;
	texture?: THREETextureProps;
	selectionAnchorRef: React.MutableRefObject<THREE.Group<THREE.Object3DEventMap> | null>;
}> = ({ cube, index, texture: textureSource, selectionAnchorRef }) => {
	const ref = React.useRef<THREE.Mesh>(null);
	const geometryRef = React.useRef<THREE.BoxGeometry>(null);
	const selectedID = useViewportSelectedSelector();

	let renderMode = useViewportSelector().renderMode;
	const texture = useTexture(textureSource.data);
	if (!textureSource) {
		renderMode = 'solid';
	}
	const dispatch = useAppDispatch();

	const outlineVisible = React.useRef(false);
	const selected = React.useRef(false);
	const [mouseDownPos, setMouseDownPos] = React.useState<THREE.Vector3>(
		new THREE.Vector3(0, 0, 0)
	);
	const matrixBefore = React.useRef<THREE.Matrix4>(new THREE.Matrix4());

	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;

	const deleteCube = () => {
		if (selectedID === cube.id) {
			dispatch(meshRemoveCube({ id: cube.id }));
		}
	};
	useKey('Delete', deleteCube, {}, [selectedID]);

	const MENU_ID = 'context_cube_' + cube.id;

	//show({ event: new MouseEvent('click') });

	React.useEffect(() => {
		if (selectedID !== cube.id) {
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
			selected.current = true;
			outlineVisible.current = true;
		}
		invalidate();
	}, [selectedID]);

	const viewport = useViewportSelector();
	const clickTimer = React.useRef<number>(0);
	const isMouseDown = React.useRef(false);
	const cameraControls = useViewportCameraSelector();

	useFrame(() => {
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
			ref.current?.position.copy(worldPos);
			ref.current?.matrixWorld.setPosition(worldPos);
			ref.current?.matrixWorld.makeRotationFromEuler(
				new THREE.Euler(
					cube.rotation[0],
					cube.rotation[1],
					cube.rotation[2]
				)
			);
			ref.current?.matrixWorld.setPosition(worldPos);
		}
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
		ref.current?.geometry.setAttribute(
			'uv',
			new THREE.Float32BufferAttribute(boxUVToVertexArray(cube.uv), 2)
		);
		ref.current?.updateMatrixWorld();
		ref.current?.updateMatrix();
		invalidate();
	});

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
			if (self === null || cube.uv === undefined) return;
			self.geometry.setAttribute(
				'uv',
				new THREE.Float32BufferAttribute(boxUVToVertexArray(cube.uv), 2)
			);
		},
		[cube.uv, cube.auto_uv]
	);

	return (
		<group matrixAutoUpdate={true} visible={cube.visible}>
			<mesh
				onUpdate={onUpdate}
				ref={ref}
				key={cube.id}
				position={cube.position}
				rotation={cube.rotation}
				scale={cube.scale}
				type="Cube"
				name={cube.name}
				onPointerLeave={() => {
					isMouseDown.current = false;
				}}
				onPointerDown={(e) => {
					setMouseDownPos(
						new THREE.Vector3(e.point.x, e.point.y, e.point.z)
					);
					isMouseDown.current = true;
				}}
				onPointerMove={(e) => {
					if (isMouseDown.current) {
						if (
							Math.abs(e.point.x - mouseDownPos.x) > 20 ||
							Math.abs(e.point.y - mouseDownPos.y) > 20
						) {
							isMouseDown.current = false;
						}
					}
				}}
				userData={{ id: cube.id }}
				customDepthMaterial={new THREE.MeshDepthMaterial()}
			>
				<boxGeometry
					args={[cube.size[0], cube.size[1], cube.size[2]]}
					attach="geometry"
					ref={geometryRef}
				/>
				{['solid', 'texture', 'render'].includes(renderMode) ? (
					<meshBasicMaterial
						map={texture}
						attach="material"
						transparent={true}
						depthTest={false}
						depthFunc={THREE.NeverDepth}
					/>
				) : (
					<>
						<Wireframe fill={'#ffffff00'} transparent></Wireframe>
						<meshBasicMaterial
							attach="material"
							color="white"
							transparent={true}
							opacity={1}
						/>
					</>
				)}

				{/* Outline */}
				<lineSegments
					visible={selected.current}
					onUpdate={(self) => {
						if (selectedID === cube.id) {
							outlineVisible.current = true;
							self.visible = true;
						} else {
							outlineVisible.current = false;
							self.visible = false;
						}
					}}
					userData={{ type: 'outline' }}
				>
					<edgesGeometry
						attach="geometry"
						args={[geometryRef.current]}
					/>
					<lineBasicMaterial attach="material" color="white" />
				</lineSegments>
			</mesh>
		</group>
	);
};

export default Cube;

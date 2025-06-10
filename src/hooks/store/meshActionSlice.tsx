import cube from '../../assets/icons/solid/cube';
import { CubeRepresentation } from '../../types/three';
import * as THREE from 'three';

export type OptionalCubeProps = Pick<
	CubeRepresentation,
	| 'position'
	| 'rotation'
	| 'pivot'
	| 'scale'
	| 'colour'
	| 'texture'
	| 'textureID'
	| 'UV'
	| 'visible'
	| 'autoUV'
	| 'mesh'
	| 'name'
	| 'id'
>;
export type RequiredCubeProps = Omit<
	CubeRepresentation,
	keyof OptionalCubeProps
>;

export type PartialCubeRepresentation = RequiredCubeProps &
	Partial<OptionalCubeProps>;

function createCubeRepresentation(
	mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>
): CubeRepresentation {
	const cube = {} as CubeRepresentation;
	cube.id = mesh.id;
	cube.name = mesh.name || 'Cube';
	cube.size = new THREE.Vector3(
		mesh.geometry.parameters.width,
		mesh.geometry.parameters.height,
		mesh.geometry.parameters.depth
	);
	cube.position = mesh.position.clone();
	cube.rotation = mesh.rotation.clone();
	cube.pivot = new THREE.Vector3();

	cube.scale = mesh.scale.x; // uniform scale

	cube.textureID = 0; // default texture index
	// TODO: add texture slice
	// then add a way to get textureid from material etc etc...
	// cube.textureID = textureSlice.findIndex(
	// mesh.texture
	//

	return cube;
}

export type ActionSlice = {
	addCube: (cube: PartialCubeRepresentation) => void;

	removeCube: (cube: CubeRepresentation) => void;
	removeCubeByIndex: (index: number) => void;

	updateCube: (cube: CubeRepresentation) => void;
	updateCubeByIndex: (index: number, cube: CubeRepresentation) => void;

	getCubeById: (id: string) => CubeRepresentation | undefined;
	getCubeByIndex: (index: number) => CubeRepresentation | undefined;
	getCubeByName: (name: string) => CubeRepresentation | undefined;
};

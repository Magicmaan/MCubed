import { Grid } from '@react-three/drei';
import { DoubleSide, NearestFilter, TextureLoader } from 'three';
import { useMemo } from 'react';

interface GridPlaneProps {
	size: number;
	lineWidth?: number;
	density?: number;
	color?: string;
}

function loadNearestTexture(textureLoader: TextureLoader, url: string) {
	const texture = textureLoader.load(url);
	texture.magFilter = NearestFilter;
	texture.minFilter = NearestFilter;
	texture.generateMipmaps = false;
	texture.needsUpdate = true;
	return texture;
}

function DebugGridPlane() {
	return (
		<group visible={false}>
			<Grid
				args={[256, 256]}
				cellSize={16}
				side={DoubleSide}
				cellThickness={0}
				sectionThickness={1}
				sectionColor={'#888888'}
			/>
		</group>
	);
}

function GridPlane({ size }: GridPlaneProps) {
	const textureLoader = useMemo(() => new TextureLoader(), []);
	const outlineTexture = useMemo(
		() => loadNearestTexture(textureLoader, '/src/assets/grid.png'),
		[textureLoader]
	);
	const xMarkerTexture = useMemo(
		() => loadNearestTexture(textureLoader, '/src/assets/x_marker.png'),
		[textureLoader]
	);
	const zMarkerTexture = useMemo(
		() => loadNearestTexture(textureLoader, '/src/assets/z_marker.png'),
		[textureLoader]
	);

	return (
		<group visible>
			<Grid
				args={[size, size]}
				cellSize={size}
				side={DoubleSide}
				cellThickness={0}
				sectionThickness={2}
				sectionColor={'#888888'}
			/>

			<mesh
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, -0.01, 0]}
				visible={true}
			>
				<planeGeometry args={[size + 2, size + 2]} />
				<meshBasicMaterial
					map={outlineTexture}
					transparent
					side={DoubleSide}
				/>
			</mesh>

			<mesh
				rotation={[-Math.PI / 2, 0, Math.PI / 2]}
				position={[12, -0.01, 0]}
				scale={[0.5, 0.5, 0.5]}
				visible={true}
			>
				<planeGeometry args={[5, 7]} />
				<meshBasicMaterial
					map={xMarkerTexture}
					transparent
					side={DoubleSide}
				/>
			</mesh>
			<mesh
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, -0.01, 12]}
				scale={[0.5, 0.5, 0.5]}
				visible={true}
			>
				<planeGeometry args={[5, 7]} />
				<meshBasicMaterial
					map={zMarkerTexture}
					transparent
					side={DoubleSide}
				/>
			</mesh>
		</group>
	);
}

export default GridPlane;
export { DebugGridPlane };

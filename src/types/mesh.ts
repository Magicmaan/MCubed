import {
	BoxGeometry,
	Color,
	EdgesGeometry,
	Euler,
	Float32BufferAttribute,
	LineBasicMaterial,
	LineSegments,
	Material,
	Mesh,
	MeshBasicMaterial,
	Object3DEventMap,
	Vector3,
} from 'three';
import { z } from 'zod';

type Visibility = boolean;
type THREETextureProps = {
	name: string;
	data: string;
	width: number;
	height: number;
};
type CubeEventMap = Object3DEventMap & {
	action: { action: CubeAction };
	select: { action: Extract<CubeAction, { type: 'select' }> };
	unselect: { action: Extract<CubeAction, { type: 'unselect' }> };
	move: object;
	rotate: object;
	resize: object;
};

export class TextureUV {
	width: number;
	height: number;
	x: number;
	y: number;

	constructor(width: number, height: number, x: number, y: number) {
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
	}
}

export class CubeUV {
	north: TextureUV;
	south: TextureUV;
	east: TextureUV;
	west: TextureUV;
	up: TextureUV;
	down: TextureUV;

	textureWidth = 1;
	textureHeight = 1;

	constructor(
		north: TextureUV,
		south: TextureUV,
		east: TextureUV,
		west: TextureUV,
		up: TextureUV,
		down: TextureUV
	) {
		this.north = north;
		this.south = south;
		this.east = east;
		this.west = west;
		this.up = up;
		this.down = down;
	}
}

function defaultCubeUV(): CubeUV {
	return new CubeUV(
		new TextureUV(1, 1, 0, 0),
		new TextureUV(1, 1, 0, 0),
		new TextureUV(1, 1, 0, 0),
		new TextureUV(1, 1, 0, 0),
		new TextureUV(1, 1, 0, 0),
		new TextureUV(1, 1, 0, 0)
	);
}

export class MetaData {
	data: Record<string, unknown>;

	constructor(data: Record<string, unknown> = {}) {
		this.data = data;
	}

	get<T>(key: string): T | undefined {
		return this.data[key] as T | undefined;
	}

	set(key: string, value: unknown): void {
		this.data[key] = value;
	}

	has(key: string): boolean {
		return key in this.data;
	}

	delete(key: string): void {
		delete this.data[key];
	}
}

const CubeActionSchema = z.union([
	z.object({
		type: z.literal('move'),
		position: z.instanceof(Vector3),
	}),
	z.object({
		type: z.literal('rotate'),
		rotation: z.instanceof(Euler),
	}),
	z.object({
		type: z.literal('resize'),
		size: z.instanceof(Vector3),
	}),
	z.object({
		type: z.literal('select'),
	}),
	z.object({
		type: z.literal('unselect'),
	}),
	z.object({
		type: z.literal('uv'),
		uv: z.instanceof(CubeUV),
	}),
]);

export type CubeAction = z.infer<typeof CubeActionSchema>;

export type CubeConstructorProps = {
	name?: string;
	position?: Vector3;
	rotation?: Euler;
	size?: Vector3;
	pivot?: Vector3;
	visible?: Visibility;
	colour?: Color;
	uv?: CubeUV;
	texture?: THREETextureProps;
	meta?: MetaData;
	material?: Material | Material[];
};

export class Cube extends Mesh<BoxGeometry, Material | Material[], CubeEventMap> {
	readonly cubeId: string;
	colour: Color;
	uv: CubeUV;
	texture: THREETextureProps;
	meta: MetaData;
	pivot: Vector3;
	selected = false;
	private _size: Vector3;
	private readonly selectionOutline: LineSegments;
	private readonly actionListener = (event: { action: CubeAction }) => {
		this.processAction(event.action);
	};
	private readonly selectListener = () => {
		this.selected = true;
		this.selectionOutline.visible = true;
	};
	private readonly unselectListener = () => {
		this.selected = false;
		this.selectionOutline.visible = false;
	};

	constructor({
		name,
		position,
		rotation,
		size,
		pivot,
		visible,
		colour,
		uv,
		texture,
		meta,
		material,
	}: CubeConstructorProps = {}) {
		const cubeColour = colour ?? new Color(0xffffff);
		const cubeSize = size?.clone() ?? new Vector3(2, 2, 2);
		super(
			new BoxGeometry(cubeSize.x, cubeSize.y, cubeSize.z),
			material ??
				new MeshBasicMaterial({
					color: cubeColour,
				})
		);

		this._size = cubeSize;
		this.selectionOutline = new LineSegments(
			new EdgesGeometry(this.geometry),
			new LineBasicMaterial({
				color: 0xffffff,
			})
		);
		this.selectionOutline.name = 'Selection Outline';
		this.selectionOutline.visible = false;
		this.selectionOutline.raycast = () => null;
		this.add(this.selectionOutline);
		this.addEventListener('action', this.actionListener);
		this.addEventListener('select', this.selectListener);
		this.addEventListener('unselect', this.unselectListener);

		this.cubeId = crypto.randomUUID();
		this.name = name ?? 'New Cube';
		this.visible = visible ?? true;
		this.colour = cubeColour;
		this.uv = uv ?? defaultCubeUV();
		this.texture =
			texture ??
			({
				name: '',
				data: '',
				width: 1,
				height: 1,
			} as THREETextureProps);
		this.meta = new MetaData(meta?.data ?? {});
		this.pivot = pivot?.clone() ?? new Vector3();
		this.userData = {
			...this.userData,
			id: this.cubeId,
			type: 'Cube',
			cube: this,
		};

		this.position.copy(position ?? new Vector3());
		this.rotation.copy(rotation ?? new Euler());
		this.scale.set(1, 1, 1);
		this.applyUV(this.uv);
		this.updateMatrixWorld(true);
	}

	get size(): Vector3 {
		return this._size.clone();
	}

	move(position: Vector3): void {
		if (this.position.equals(position)) return;

		this.position.copy(position);
		this.updateMatrixWorld(true);
		this.dispatchEvent({ type: 'move' });
	}

	rotate(rotation: Euler): void {
        if (this.rotation.equals(rotation)) return;

		this.rotation.copy(rotation);
		this.updateMatrixWorld(true);
		this.dispatchEvent({ type: 'rotate' });
	}

	resize(size: Vector3): void {
		const nextSize = this.sanitiseSize(size);
		if (this._size.equals(nextSize)) return;

		this._size.copy(nextSize);
		const previousGeometry = this.geometry;
		const previousOutlineGeometry = this.selectionOutline.geometry;

        // recreate geometry & outline geometry with new size
		this.geometry = new BoxGeometry(this._size.x, this._size.y, this._size.z);
		this.applyUV(this.uv);
		this.selectionOutline.geometry = new EdgesGeometry(this.geometry);
		this.scale.set(1, 1, 1);

		previousGeometry.dispose();
		previousOutlineGeometry.dispose();
		this.updateMatrixWorld(true);
		this.dispatchEvent({ type: 'resize' });
	}

	processAction(action: CubeAction): void {
		CubeActionSchema.parse(action);
            
		switch (action.type) {
			case 'move':
				this.applyMoveAction(action);
				break;
			case 'rotate':
				this.applyRotateAction(action);
				break;
			case 'resize':
				this.applyResizeAction(action);
				break;
			case 'select':
				this.dispatchEvent({ type: 'select', action });
				break;
			case 'unselect':
				this.dispatchEvent({ type: 'unselect', action });
				break;
			case 'uv':
				this.applyUV(action.uv);
				break;
		}
	}

	applyMoveAction(action: Extract<CubeAction, { type: 'move' }>): void {
		this.move(action.position);
	}

	applyRotateAction(action: Extract<CubeAction, { type: 'rotate' }>): void {
		this.rotate(action.rotation);
	}

	applyResizeAction(action: Extract<CubeAction, { type: 'resize' }>): void {
		this.resize(action.size);
	}

	private sanitiseSize(size: Vector3): Vector3 {
		const snapDimension = (value: number) =>
			Math.max(Math.round(Math.abs(value) / 2) * 2, 2);

		return new Vector3(
			snapDimension(size.x),
			snapDimension(size.y),
			snapDimension(size.z)
		);
	}

	applyUV(uv: CubeUV): void {
		this.uv = uv;
		this.geometry.setAttribute(
			'uv',
			new Float32BufferAttribute(this.uvToVertexArray(uv), 2)
		);
		this.geometry.attributes.uv.needsUpdate = true;
	}

	private uvToVertexArray(_uv: CubeUV): number[] {
		return [
			0, 1, 1, 1, 0, 0, 1, 0,
			0, 1, 1, 1, 0, 0, 1, 0,
			0, 1, 1, 1, 0, 0, 1, 0,
			0, 1, 1, 1, 0, 0, 1, 0,
			0, 1, 1, 1, 0, 0, 1, 0,
			0, 1, 1, 1, 0, 0, 1, 0,
		];
	}

	dispose(): void {
		this.removeEventListener('action', this.actionListener);
		this.removeEventListener('select', this.selectListener);
		this.removeEventListener('unselect', this.unselectListener);
		this.geometry.dispose();
		this.selectionOutline.geometry.dispose();
		const materials = Array.isArray(this.material)
			? this.material
			: [this.material];
		materials.forEach((material) => material.dispose());
		const outlineMaterial = this.selectionOutline.material;
		const outlineMaterials = Array.isArray(outlineMaterial)
			? outlineMaterial
			: [outlineMaterial];
		outlineMaterials.forEach((material) => material.dispose());
	}
}

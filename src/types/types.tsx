type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type BBModelElement = {
	name: string;
	box_uv: boolean;
	rescale: boolean;
	locked: boolean;
	light_emission: number;
	render_order: string;
	from: [number, number, number];
	to: [number, number, number];
	autouv: number;
	color: number;
	inflate: number;
	origin: [number, number, number];
	rotation: [number, number, number];
	uv_offset: [number, number];
	mirror_uv: boolean;
	faces: {
		north: {
			uv: [number, number, number, number];
			texture: number;
		};
		east: {
			uv: [number, number, number, number];
			texture: number;
		};
		south: {
			uv: [number, number, number, number];
			texture: number;
		};
		west: {
			uv: [number, number, number, number];
			texture: number;
		};
		up: {
			uv: [number, number, number, number];
			texture: number;
		};
		down: {
			uv: [number, number, number, number];
			texture: number;
		};
	};
	type: string;
	uuid: string;
	allow_mirror_modeling: boolean;
	tardis_control: string;
};
type BBModelTexture = {
	path: string;
	name: string;
	folder: string;
	namespace: string;
	id: string;
	group: string;
	width: number;
	height: number;
	uv_width: number;
	uv_height: number;
	particle: boolean;
	use_as_default: boolean;
	layers_enabled: boolean;
	sync_to_project: string;
	render_mode: string;
	render_sides: string;
	frame_time: number;
	frame_order_type: string;
	frame_order: string;
	frame_interpolate: boolean;
	visible: boolean;
	internal: boolean;
	saved: boolean;
	uuid: string;
	source: string;
};

type BBModelFile = {
	meta: {
		format_version: string;
		model_format: 'modded_entity' | 'free' | string;
		box_uv: boolean;
	};
	name: string;
	model_identifier: string;
	visible_box: [number, number, number];
	variable_placeholders: string;
	variable_placeholder_buttons: never[];
	timeline_setups: never[];
	unhandled_root_fields: Record<string, unknown>;
	resolution: {
		width: number;
		height: number;
	};
	elements: BBModelElement[];
	outliner: never[];
	textures: BBModelTexture[];
};

export type { Expand };
export type { BBModelElement as BBModelCube, BBModelTexture, BBModelFile };

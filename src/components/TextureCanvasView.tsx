import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import SideBarWidget from './templates/SideBarWidget';
import {
	useAppDispatch,
	useMeshDataSelector,
	useMeshStoreSelector,
	useMeshTextureSelector,
	useViewportSelector,
} from '../hooks/useRedux';
import { meshModifyIndex } from '../redux/reducers/meshReducer';
import ToggleButtonIcon from './templates/ToggleButtonIcon';
import { BoxUVMap, loadTexture } from '../util/textureUtil';
import { getBase64 } from '../util/fileUtil';
import { readFile, readFileSync } from 'fs';
import { Box } from 'lucide-react';
import { temp, uv } from 'three/webgpu';
import TextureCanvas from './TextureCanvas';
import { THREETextureProps } from '../types/three';
import { Item, Menu, useContextMenu } from 'react-contexify';

//TODO:
// - Add ability to change UV map
// - Add ability to change texture
// - Add ability to move UVs
//   - Add ability to move UVs in pixels
//   - deposition UV to get just offsets
//   - use offsets and then apply movement etc to UVs

class UVMap {
	sourceWidth: number;
	sourceHeight: number;

	top: number[];
	bottom: number[];
	left: number[];
	right: number[];
	front: number[];
	back: number[];

	constructor({
		top = [0, 0, 0, 0],
		bottom = [0, 0, 0, 0],
		left = [0, 0, 0, 0],
		right = [0, 0, 0, 0],
		front = [0, 0, 0, 0],
		back = [0, 0, 0, 0],
		sourceWidth = 0,
		sourceHeight = 0,
	}: {
		top?: number[];
		bottom?: number[];
		left?: number[];
		right?: number[];
		front?: number[];
		back?: number[];
		sourceWidth?: number;
		sourceHeight?: number;
	}) {
		this.top = top;
		this.bottom = bottom;
		this.left = left;
		this.right = right;
		this.front = front;
		this.back = back;

		this.sourceWidth = sourceWidth;
		this.sourceHeight = sourceHeight;
	}
	ONE_UNIT = 1 / 8;
	defaultMatrix() {
		const o1 = this.ONE_UNIT;
		return {
			top: [o1, 0, o1 * 2, o1],
			bottom: [o1 * 2, 0, o1 * 3, o1],

			left: [0, o1, o1, o1 * 2],
			front: [o1, o1, o1 * 2, o1 * 2],
			right: [o1 * 2, o1, o1 * 3, o1 * 2],
			back: [o1 * 3, o1, o1 * 4, o1 * 2],
		};
	}

	getUVMap() {
		return {
			top: this.top,
			bottom: this.bottom,
			left: this.left,
			right: this.right,
			front: this.front,
			back: this.back,
		};
	}
	getBounds() {
		return {
			x: this.left[0],
			y: this.top[1],
			w: this.back[2],
			h: this.front[3],
		};
	}
	toPixels() {
		return {
			top: [
				this.sourceWidth * this.top[0],
				this.sourceHeight * this.top[1],
				this.sourceWidth * this.top[2] - this.sourceWidth * this.top[0],
				this.sourceHeight * this.top[3] -
					this.sourceHeight * this.top[1],
			],
			bottom: [
				this.sourceWidth * this.bottom[0],
				this.sourceHeight * this.bottom[1],
				this.sourceWidth * this.bottom[2] -
					this.sourceWidth * this.bottom[0],
				this.sourceHeight * this.bottom[3] -
					this.sourceHeight * this.bottom[1],
			],
			left: [
				this.sourceWidth * this.left[0],
				this.sourceHeight * this.left[1],
				this.sourceWidth * this.left[2] -
					this.sourceWidth * this.left[0],
				this.sourceHeight * this.left[3] -
					this.sourceHeight * this.left[1],
			],
			right: [
				this.sourceWidth * this.right[0],
				this.sourceHeight * this.right[1],
				this.sourceWidth * this.right[2] -
					this.sourceWidth * this.right[0],
				this.sourceHeight * this.right[3] -
					this.sourceHeight * this.right[1],
			],
			front: [
				this.sourceWidth * this.front[0],
				this.sourceHeight * this.front[1],
				this.sourceWidth * this.front[2] -
					this.sourceWidth * this.front[0],
				this.sourceHeight * this.front[3] -
					this.sourceHeight * this.front[1],
			],
			back: [
				this.sourceWidth * this.back[0],
				this.sourceHeight * this.back[1],
				this.sourceWidth * this.back[2] -
					this.sourceWidth * this.back[0],
				this.sourceHeight * this.back[3] -
					this.sourceHeight * this.back[1],
			],
		};
	}
	toPixelsFromMap(
		width: number,
		height: number,
		map: {
			top: number[];
			bottom: number[];
			left: number[];
			right: number[];
			front: number[];
			back: number[];
		}
	) {
		return {
			top: [
				width * map.top[0],
				height * map.top[1],
				width * map.top[2],
				height * map.top[3],
			],
			bottom: [
				width * map.bottom[0],
				height * map.bottom[1],
				width * map.bottom[2],
				height * map.bottom[3],
			],
			left: [
				width * map.left[0],
				height * map.left[1],
				width * map.left[2],
				height * map.left[3],
			],
			right: [
				width * map.right[0],
				height * map.right[1],
				width * map.right[2],
				height * map.right[3],
			],
			front: [
				width * map.front[0],
				height * map.front[1],
				width * map.front[2],
				height * map.front[3],
			],
			back: [
				width * map.back[0],
				height * map.back[1],
				width * map.back[2],
				height * map.back[3],
			],
		};
	}

	// Shift position of UV map in pixels
	addPosition(x: number, y: number) {
		const roundedX = Math.round(x);
		const roundedY = Math.round(y);

		const dM = this.defaultMatrix();

		const oX = (1 / this.sourceWidth) * 2 * roundedX;
		const oY = (1 / this.sourceHeight) * 2 * roundedY;

		this.top = [
			this.top[0] + oX,
			this.top[1] + oY,
			this.top[2] + oX,
			this.top[3] + oY,
		];
		this.bottom = [
			this.bottom[0] + oX,
			this.bottom[1] + oY,
			this.bottom[2] + oX,
			this.bottom[3] + oY,
		];
		this.left = [
			this.left[0] + oX,
			this.left[1] + oY,
			this.left[2] + oX,
			this.left[3] + oY,
		];
		this.front = [
			this.front[0] + oX,
			this.front[1] + oY,
			this.front[2] + oX,
			this.front[3] + oY,
		];
		this.right = [
			this.right[0] + oX,
			this.right[1] + oY,
			this.right[2] + oX,
			this.right[3] + oY,
		];
		this.back = [
			this.back[0] + oX,
			this.back[1] + oY,
			this.back[2] + oX,
			this.back[3] + oY,
		];
	}
}

const TextureCanvasView: React.FC = () => {
	const meshTextures = useMeshTextureSelector();
	const meshData = useMeshDataSelector();
	const currentTexture = useMemo(
		() => meshTextures.find((t) => t.active),
		[meshTextures]
	);
	const templateTexture = useMemo(
		() => meshTextures.find((t) => t.id === 'TEMPLATE'),
		[meshTextures]
	);

	const activeTexture = useMemo(() => {
		const src = currentTexture || templateTexture;
		const image = new Image();

		if (src) {
			image.src = src.data;
			image.width = src.width;
			image.height = src.height;
			image.style.imageRendering = 'pixelated';
		}
		return image;
	}, [currentTexture]);

	const boxUVs = useMemo(() => {
		return meshData.map((cube) =>
			new BoxUVMap({ cubeID: cube.id }).fromUVMap(
				cube.uv,
				activeTexture.width,
				activeTexture.height
			)
		);
	}, [meshData]);

	const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			getBase64(file)
				.then((result) => {
					console.log(result);
				})
				.catch((err) => {
					console.error(err);
				});
		}
	}, []);

	return (
		<SideBarWidget name="Texture">
			<div
				className="flex h-auto w-auto cursor-default select-none flex-col flex-nowrap gap-1 rounded-lg bg-red-200 p-1"
				style={{ imageRendering: 'pixelated' }}
			>
				<div className="flex aspect-square h-auto w-auto flex-row flex-nowrap gap-1 bg-blue-500 p-1">
					<TextureCanvas image={activeTexture} boxUVs={boxUVs} />
				</div>

				<input
					className="pointer-events-auto"
					type="file"
					accept="image/png"
					onChange={onChange}
				/>
				<TextureItem texture={currentTexture} />
				<TextureItem texture={templateTexture} />
			</div>
		</SideBarWidget>
	);
};

const TextureItem: React.FC<{
	texture?: THREETextureProps;
}> = ({ texture }) => {
	const dispatch = useAppDispatch();
	const MENU_ID = 'context_texture_' + (texture?.id || 'default');
	const { show } = useContextMenu({
		id: MENU_ID,
	});
	const handleContextMenu = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		show({
			event,
		});
		event.preventDefault();
		event.stopPropagation();
	};

	return (
		<button
			id={'texture_' + (texture?.id || 'default')}
			onContextMenuCapture={handleContextMenu}
			className="pointer-events-auto flex h-14 w-full select-none flex-row flex-nowrap items-center justify-start gap-2 rounded-md bg-secondary hover:bg-button-hover focus:outline-none"
		>
			<div className="aspect-square h-full w-auto items-center justify-center bg-red-500">
				<img src={texture?.data} className="h-full w-full" />
			</div>
			{texture?.name || 'Unnamed Texture'}

			<Menu id={MENU_ID} theme="contextTheme" className="bg-red-500">
				<Item id="reload" onClick={() => {}}>
					Reload
				</Item>
				<Item id="delete">Delete</Item>
			</Menu>
		</button>
	);
};

export default TextureCanvasView;

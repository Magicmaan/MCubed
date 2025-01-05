import React, { useEffect, useMemo, useRef, useState } from 'react';
import SideBarWidget from './templates/SideBarWidget';
import {
	useAppDispatch,
	useMeshDataSelector,
	useMeshStoreSelector,
	useMeshTextureSelector,
	useViewportSelector,
} from '../hooks/useRedux';
import { meshModifyIndex } from '../reducers/meshReducer';
import ToggleButtonIcon from './templates/ToggleButtonIcon';
import { BoxUVMap, loadTexture } from '../util/textureUtil';
import { getBase64 } from '../util/baseSFUtil';
import { readFile, readFileSync } from 'fs';
import { Box } from 'lucide-react';

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
	const viewportStore = useViewportSelector();
	const meshStore = useMeshStoreSelector();
	const meshData = useMeshDataSelector();
	const textureData = useRef(useMeshTextureSelector()[0].data);

	const image = new Image();
	image.src = textureData.current;
	image.width = 256;
	image.height = 256;
	image.style.imageRendering = 'pixelated';

	const uvs = useRef(new UVMap({ sourceWidth: 256, sourceHeight: 256 }));

	const testUV = new BoxUVMap({ width: 16, height: 16, depth: 16 });
	testUV.setPosition(16, 16);
	const boxUVs = useRef([
		new BoxUVMap({ width: 16, height: 16, depth: 16 }),
		testUV,
	]);

	const isDragging = useRef(false);
	const mousePosition = useRef({ x: 0, y: 0 });

	const dragState = useRef<'board' | 'uv'>('board');
	const position = useState({ x: 0, y: 0 });
	const scale = useState(1);

	const dispatch = useAppDispatch();

	useEffect(() => {
		for (let i = 0; i < meshData.length; i++) {
			const cube = meshData[i];
			if (!cube.size) continue;
			const uv = new BoxUVMap({
				width: cube.size[0] ?? 16,
				height: cube.size[1] ?? 16,
				depth: cube.size[2] ?? 16,
			});
			//uv.setPosition(cube.position[0], cube.position[1]);

			dispatch(
				meshModifyIndex({
					index: i,
					uv: uv.toUVMap(128, 128),
				})
			);
		}

		// dispatch(meshModifyIndex({ index: 0, uv: boxUVs.current.toUVMap(128, 128) }));
	}, [boxUVs]);

	const drawSrcImage = (ctx: CanvasRenderingContext2D) => {
		ctx.fillStyle = '#dbdbdb';
		ctx.fillRect(
			position[0].x - 5,
			position[0].y - 5,
			image.width + 10,
			image.height + 10
		);
		ctx.drawImage(
			image,
			position[0].x,
			position[0].y,
			image.width,
			image.height
		);
	};

	const drawHighlightRect = (
		ctx: CanvasRenderingContext2D,
		stroke: string,
		fill: string,
		x: number,
		y: number,
		w: number,
		h: number
	) => {
		ctx.strokeStyle = stroke;
		ctx.fillStyle = fill;
		ctx.strokeRect(x * 2, y * 2, w * 2, h * 2);
		ctx.fillRect(x * 2, y * 2, w * 2, h * 2);
	};

	const drawUVMap = (ctx: CanvasRenderingContext2D) => {
		const width = image.width;
		const height = image.height;

		if (boxUVs.current) {
			boxUVs.current.forEach((uvobj) => {
				var map = uvobj.toPixels();
				const UV = uvobj.toUVMap(width, height);
				//console.log("Map UV", UV);
				//console.log("Map", map);
				//top
				drawHighlightRect(
					ctx,
					'white',
					'rgba(255, 255, 255, 0.25)',
					map.top[0] + position[0].x / 2,
					map.top[1] + position[0].y / 2,
					map.top[2],
					map.top[3]
				);
				//bottom
				drawHighlightRect(
					ctx,
					'black',
					'rgba(0, 0, 0, 0.25)',
					map.bottom[0] + position[0].x / 2,
					map.bottom[1] + position[0].y / 2,
					map.bottom[2],
					map.bottom[3]
				);
				// left
				drawHighlightRect(
					ctx,
					'rgb(0, 255, 0)',
					'rgba(0, 255, 0, 0.25)',
					map.left[0] + position[0].x / 2,
					map.left[1] + position[0].y / 2,
					map.left[2],
					map.left[3]
				);
				// right
				drawHighlightRect(
					ctx,
					'red',
					'rgba(255, 0, 0, 0.25)',
					map.right[0] + position[0].x / 2,
					map.right[1] + position[0].y / 2,
					map.right[2],
					map.right[3]
				);
				// front
				drawHighlightRect(
					ctx,
					'blue',
					'rgba(0, 0, 255, 0.25)',
					map.front[0] + position[0].x / 2,
					map.front[1] + position[0].y / 2,
					map.front[2],
					map.front[3]
				);
				// back
				drawHighlightRect(
					ctx,
					'yellow',
					'rgba(255, 255, 0, 0.25)',
					map.back[0] + position[0].x / 2,
					map.back[1] + position[0].y / 2,
					map.back[2],
					map.back[3]
				);
			});
		}
	};

	const getCanvasPosition = (
		ctx: CanvasRenderingContext2D,
		inx: number,
		iny: number
	) => {
		const rect = ctx.canvas.getBoundingClientRect();
		const x = inx - rect.left;
		const y = iny - rect.top;
		return { x, y };
	};

	const drawCanvas = (ctx: CanvasRenderingContext2D) => {
		ctx.canvas.width = 256;
		ctx.canvas.height = 256;
		ctx.imageSmoothingEnabled = false;

		//ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.scale(scale[0], scale[0]);

		drawSrcImage(ctx);
		drawUVMap(ctx);

		const mouseXY = getCanvasPosition(
			ctx,
			mousePosition.current.x,
			mousePosition.current.y
		);
		ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		ctx.fillRect(mouseXY.x / scale[0], mouseXY.y / scale[0], 16, 16);
	};

	const onWheel = React.useCallback(
		(e: React.WheelEvent<HTMLCanvasElement>) => {
			//Wheel", e);
			const delta = e.deltaY;
			if (delta > 0) {
				scale[1]((prev) => prev - 0.1);
			} else {
				scale[1]((prev) => prev + 0.1);
			}
			//scale[1](newScale);
			//console.log("Scale", scale);
		},
		[]
	);

	const canvasDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
		position[1]({
			x: e.movementX / scale[0] + position[0].x,
			y: e.movementY / scale[0] + position[0].y,
		});
	};

	const uvDrag = React.useCallback(
		(e: React.PointerEvent<HTMLCanvasElement>) => {
			uvs.current.addPosition(
				Math.round(e.movementX / 2 / scale[0]),
				Math.round(e.movementY / 2 / scale[0])
			);
		},
		[]
	);

	return (
		<SideBarWidget name="Texture">
			<div
				className="flex cursor-default select-none flex-col flex-nowrap gap-1 rounded-lg bg-red-200 p-1"
				style={{ imageRendering: 'pixelated' }}
			>
				<canvas
					onWheel={onWheel}
					onPointerDown={(e) => {
						isDragging.current = true;
					}}
					onPointerMove={(e) => {
						mousePosition.current = { x: e.clientX, y: e.clientY };
						if (isDragging.current) {
							if (dragState.current === 'board') {
								//console.log("deltas", e);

								canvasDrag(e);
							} else if (dragState.current === 'uv') {
								uvs.current.addPosition(
									Math.round(e.movementX / 2 / scale[0]),
									Math.round(e.movementY / 2 / scale[0])
								);
							}
						}
					}}
					onPointerUp={(e) => {
						isDragging.current = false;
					}}
					onClick={(e) => {}}
					className="pointer-events-auto aspect-square h-[256px] w-[256px] rounded-md border-2 border-black bg-black"
					style={{ imageRendering: 'pixelated' }}
					ref={(canvas) => {
						if (canvas) {
							const ctx = canvas.getContext('2d');
							if (ctx) {
								ctx.imageSmoothingEnabled = false;
								drawCanvas(ctx);
							}
						}
					}}
				>
					Your browser does not support the HTML5 canvas tag.
				</canvas>
				<img
					src={textureData.current}
					alt="Texture"
					style={{ imageRendering: 'pixelated' }}
				/>
				<div className="h-10 w-full rounded-sm bg-red-500">
					{/* <ToggleButtonIcon /> */}
				</div>
				<input
					className="pointer-events-auto"
					type="file"
					accept="image/png"
					onClick={(e) => {
						console.log('File click', e);
					}}
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) {
							console.log('File', file);

							getBase64(file)
								.then((result) => {
									console.log('File Is', result);
									textureData.current = result as string;
								})
								.catch((err) => {
									console.log(err);
								});
						}
					}}
				/>
			</div>
		</SideBarWidget>
	);
};

export default TextureCanvasView;

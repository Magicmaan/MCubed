import React, { useRef, useState, useEffect } from 'react';
import { BoxUVMap } from '../util/textureUtil';
import { useAppDispatch } from '../hooks/useRedux';
import { meshModifyID } from '../redux/reducers/meshReducer';

const TextureCanvas: React.FC<{
	image: HTMLImageElement;
	boxUVs: BoxUVMap[];
}> = ({ image, boxUVs }) => {
	console.log('boxUV', boxUVs[0]);
	console.log('image size', image.width, image.height);

	const drawUVs = useRef(true);
	const drawUVBounds = useRef(true);

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [imageScale, setImageScale] = useState(1);
	const [imagePosition, setImagePosition] = useState({ x: 16, y: 0 });

	const dispatch = useAppDispatch();
	const getCanvasMousePosition = (e: React.MouseEvent) => {
		if (!canvasRef.current) return { x: 0, y: 0 };

		const canvasPosition = canvasRef.current?.getBoundingClientRect();
		const scaleX = canvasRef.current.width / canvasPosition.width;
		const scaleY = canvasRef.current.height / canvasPosition.height;

		const mouseX = (e.clientX - (canvasPosition?.x || 0)) * scaleX;
		const mouseY = (e.clientY - (canvasPosition?.y || 0)) * scaleY;
		return { x: mouseX, y: mouseY };
	};

	const mouseDown = useRef(false);
	const mouseFocus = useRef<'canvas' | 'uv'>('canvas');
	const focusedUV = useRef<BoxUVMap | null>(null);
	const grabOffset = useRef({ x: 0, y: 0 });
	const uvGrabOffset = useRef({ x: 0, y: 0 });

	const scaleAndPositionUV = (uv: {
		top: number[];
		bottom: number[];
		left: number[];
		right: number[];
		front: number[];
		back: number[];
	}) => {
		// const width = uv.front[2] - uv.front[0];
		// uv.bottom = [uv.top[0] + width, uv.top[1], uv.top[2], uv.top[3]];

		// apply scale and position to UV map
		// prettier-ignore
		uv.top = [
			(((uv.top[0]+uv.top[2]) /2 * imageScale) + imagePosition.x ),
			(uv.top[1] * imageScale) / 2 + imagePosition.y,
			uv.top[2] * imageScale,
			uv.top[3] * imageScale,
		];
		uv.bottom = [
			((uv.bottom[0] + uv.bottom[2]) / 2) * imageScale +
				imagePosition.x +
				uv.top[2] / 2,
			(uv.bottom[1] * imageScale) / 2 + imagePosition.y,
			uv.bottom[2] * imageScale,
			uv.bottom[3] * imageScale,
		];
		uv.left = [
			((uv.left[0] + uv.left[2]) / 2) * imageScale +
				imagePosition.x -
				uv.top[2] / 2,
			(uv.left[1] * imageScale) / 2 + imagePosition.y + uv.top[3] / 2,
			uv.left[2] * imageScale,
			uv.left[3] * imageScale,
		];

		uv.front = [
			((uv.front[0] + uv.front[2]) / 2) * imageScale + imagePosition.x,
			(uv.front[1] * imageScale) / 2 + imagePosition.y + uv.top[3] / 2,
			uv.front[2] * imageScale,
			uv.front[3] * imageScale,
		];
		uv.back = [
			((uv.back[0] + uv.back[2]) / 2) * imageScale + imagePosition.x,
			(uv.back[1] * imageScale) / 2 + imagePosition.y + uv.top[3] / 2,
			uv.back[2] * imageScale,
			uv.back[3] * imageScale,
		];
		uv.right = [
			((uv.right[0] + uv.right[2]) / 2) * imageScale +
				imagePosition.x +
				uv.front[2] +
				uv.back[2] / 2,
			(uv.right[1] * imageScale) / 2 + imagePosition.y + uv.top[3] / 2,
			uv.right[2] * imageScale,
			uv.right[3] * imageScale,
		];

		return uv;
	};

	const scaleAndPositionRect = (rect: number[]) => {
		const scale = imageScale;
		const position = {
			x: imagePosition.x,
			y: imagePosition.y,
		};
		const scaledRect = [
			rect[0] * scale,
			rect[1] * scale,
			rect[2] * scale,
			rect[3] * scale,
		];
		scaledRect[0] /= 2;
		scaledRect[1] /= 2;
		scaledRect[0] += position.x;
		scaledRect[1] += position.y;

		return scaledRect;
	};
	const scaleAndPositionBounds = ({
		x,
		y,
		w,
		h,
	}: {
		x: number;
		y: number;
		w: number;
		h: number;
	}) => {
		return scaleAndPositionRect([x, y, w, h]);
	};

	const drawSrcImage = (ctx: CanvasRenderingContext2D) => {
		ctx.drawImage(
			image,
			imagePosition.x,
			imagePosition.y,
			image.width * imageScale,
			image.height * imageScale
		);
	};

	const drawHighlightRect = (
		ctx: CanvasRenderingContext2D,
		stroke: string,
		fill: string,
		x: number,
		y: number,
		w: number,
		h: number,
		lineWidth: number = 1
	) => {
		ctx.save();
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = stroke;
		ctx.fillStyle = fill;
		ctx.strokeRect(x, y, w, h);
		ctx.fillRect(x, y, w, h);
		ctx.restore();
	};

	const drawUVMap = (ctx: CanvasRenderingContext2D) => {
		if (!drawUVs.current) return;
		if (boxUVs) {
			boxUVs.forEach((uvobj) => {
				//console.log('raw box uv', uvobj.toPixels());
				//console.log('raw uv box', uvobj.toUVMap(128, 128));
				//const map = scaleAndPositionUV(uvobj.toPixels());
				const bounds = scaleAndPositionBounds(uvobj.getBounds());

				const w = uvobj.width * imageScale;
				const h = uvobj.height * imageScale;
				const d = uvobj.depth * imageScale;

				const map = {
					top: [bounds[0] + d, bounds[1], w, d],
					bottom: [bounds[0] + w + d, bounds[1], w, d],
					left: [bounds[0], bounds[1] + d, d, h],
					right: [bounds[0] + d, bounds[1] + d, d, h],
					front: [bounds[0] + d * 2, bounds[1] + d, w, h],
					back: [bounds[0] + d + w + d, bounds[1] + d, w, h],
				};

				console.log(
					'box top face',
					map.top[0],
					map.top[1],
					map.top[2],
					map.top[3]
				);
				// top
				drawHighlightRect(
					ctx,
					'white',
					'rgba(255, 255, 255, 0.25)',
					map.top[0],
					map.top[1],
					map.top[2],
					map.top[3]
				);
				// bottom
				drawHighlightRect(
					ctx,
					'black',
					'rgba(0, 0, 0, 0.25)',
					map.bottom[0],
					map.bottom[1],
					map.bottom[2],
					map.bottom[3]
				);
				// left
				drawHighlightRect(
					ctx,
					'rgb(0, 255, 0)',
					'rgba(0, 255, 0, 0.25)',
					map.left[0],
					map.left[1],
					map.left[2],
					map.left[3]
				);
				// right
				drawHighlightRect(
					ctx,
					'red',
					'rgba(255, 0, 0, 0.25)',
					map.right[0],
					map.right[1],
					map.right[2],
					map.right[3]
				);
				// front
				drawHighlightRect(
					ctx,
					'blue',
					'rgba(0, 0, 255, 0.25)',
					map.front[0],
					map.front[1],
					map.front[2],
					map.front[3]
				);
				// back
				drawHighlightRect(
					ctx,
					'yellow',
					'rgba(255, 255, 0, 0.25)',
					map.back[0],
					map.back[1],
					map.back[2],
					map.back[3]
				);

				if (drawUVBounds.current) {
					//bounds
					drawHighlightRect(
						ctx,
						'white',
						'rgba(255, 255, 255, 0.125)',
						bounds[0],
						bounds[1],
						bounds[2],
						bounds[3],
						2
					);
				}
			});
		}
	};

	const drawCanvas = (ctx: CanvasRenderingContext2D) => {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		drawSrcImage(ctx);
		drawUVMap(ctx);
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		console.log('Mouse Down', e);
		mouseDown.current = true;

		const mousePos = getCanvasMousePosition(e);
		grabOffset.current = {
			x: mousePos.x - imagePosition.x,
			y: mousePos.y - imagePosition.y,
		};

		console.log('Mouse Position Down', mousePos);
		console.log('grab position', grabOffset.current);

		// check if mouse is over canvas
		if (
			mousePos.x > imagePosition.x &&
			mousePos.x < imagePosition.x + image.width * imageScale &&
			mousePos.y > imagePosition.y &&
			mousePos.y < imagePosition.y + image.height * imageScale
		) {
			mouseFocus.current = 'canvas';
			console.log('FOCUSING CANVAS');
		}
		// check if mouse is over UV
		boxUVs.forEach((uvobj) => {
			const bounds = scaleAndPositionBounds(uvobj.getBounds());
			console.log('Bounds', bounds[0], bounds[1], bounds[2], bounds[3]);
			if (
				mousePos.x > bounds[0] &&
				mousePos.x < bounds[0] + bounds[2] &&
				mousePos.y > bounds[1] &&
				mousePos.y < bounds[1] + bounds[3]
			) {
				mouseFocus.current = 'uv';
				focusedUV.current = uvobj;
				uvGrabOffset.current = {
					x: mousePos.x - bounds[0],
					y: mousePos.y - bounds[1],
				};
				console.log('FOCUSING UV');
			}
		});
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!mouseDown.current) return;

		//console.log('Mouse Move', e);
		if (mouseFocus.current === 'canvas') {
			canvasDrag(e);
		} else {
			uvDrag(e);
		}
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		mouseDown.current = false;
	};

	const handleMouseLeave = (e: React.MouseEvent) => {
		mouseDown.current = false;
	};

	const handleMouseEnter = (e: React.MouseEvent) => {};

	const canvasDrag = (e: React.MouseEvent) => {
		console.log('Dragging canvas');
		const newPos = getCanvasMousePosition(e);
		newPos.x -= grabOffset.current.x;
		newPos.y -= grabOffset.current.y;
		console.log('New Position', newPos);

		setImagePosition(newPos);
	};

	const uvDrag = (e: React.MouseEvent) => {
		if (!focusedUV.current) return;

		const newPos = getCanvasMousePosition(e);
		newPos.x -= uvGrabOffset.current.x;
		newPos.y -= uvGrabOffset.current.y;

		const updatedUV = new BoxUVMap({
			width: focusedUV.current.width,
			height: focusedUV.current.height,
			depth: focusedUV.current.depth,
		}).setPosition(
			Math.floor((newPos.x - imagePosition.x) / imageScale),
			Math.floor((newPos.y - imagePosition.y) / imageScale)
		);

		dispatch(
			meshModifyID({
				id: focusedUV.current.cubeID,
				uv: updatedUV.toUVMap(image.width, image.height) as any,
			})
		);
	};

	useEffect(() => {
		if (canvasRef.current) {
			const context = canvasRef.current.getContext('2d');
			if (context) {
				context.imageSmoothingEnabled = false;
				drawCanvas(context);
			}
		}
	}, [imageScale, imagePosition, boxUVs]);

	return (
		<canvas
			className="pointer-events-auto flex aspect-square h-full w-full rounded-md border-2 border-black bg-black"
			style={{
				imageRendering: 'pixelated',
				width: '100%',
				height: '100%',
			}}
			width={image.width * 4}
			height={image.height * 4}
			ref={canvasRef}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onWheel={(e) => {
				if (e.deltaY > 0) {
					setImageScale((prev) => prev - 0.1);
				} else {
					setImageScale((prev) => prev + 0.1);
				}
				e.stopPropagation();
			}}
			onScroll={(e) => {
				e.stopPropagation();
				e.preventDefault();
			}}
		>
			Your browser does not support the HTML5 canvas tag.
		</canvas>
	);
};

export default TextureCanvas;

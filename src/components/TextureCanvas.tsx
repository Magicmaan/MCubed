import React, {
	useEffect,
	useRef,
	useState,
	useMemo,
	useCallback,
} from 'react';
import { BoxUVMap } from '../util/textureUtil';
import { useAppDispatch } from '../hooks/useRedux';
import { meshModifyID } from '../redux/reducers/meshReducer';

const TextureCanvas: React.FC<{
	image: HTMLImageElement;
	boxUVs: BoxUVMap[];
}> = ({ image, boxUVs }) => {
	const drawUVs = useRef(true);
	const drawUVBounds = useRef(true);

	const canvasRef = useRef<HTMLCanvasElement>();
	const canvasWidth = canvasRef.current?.width;
	const canvasHeight = canvasRef.current?.height;
	const [imageScale, setImageScale] = useState(2);
	const [imagePosition, setImagePosition] = useState({ x: 16, y: 0 });

	const dispatch = useAppDispatch();
	const getCanvasMousePosition = (e: React.MouseEvent) => {
		if (canvasRef.current === null) return { x: 0, y: 0 };

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
		// apply scale and position to UV map
		uv.top = scaleAndPositionRect(uv.top);
		uv.bottom = scaleAndPositionRect(uv.bottom);
		uv.left = scaleAndPositionRect(uv.left);
		uv.right = scaleAndPositionRect(uv.right);
		uv.front = scaleAndPositionRect(uv.front);
		uv.back = scaleAndPositionRect(uv.back);

		return uv;
	};

	const scaleAndPositionRect = (rect: number[]) => {
		const scale = imageScale;
		const position = imagePosition;
		const scaledRect = [
			rect[0] * scale,
			rect[1] * scale,
			rect[2] * scale,
			rect[3] * scale,
		];
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
		console.log('drawing image at', imagePosition);
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
				console.log('raw box uv', uvobj.toPixels());
				console.log('raw uv box', uvobj.toUVMap(128, 128));
				const map = scaleAndPositionUV(uvobj.toPixels());
				const bounds = scaleAndPositionBounds(uvobj.getBounds());

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
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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
		newPos.x -= imagePosition.x + uvGrabOffset.current.x;
		newPos.y -= imagePosition.y + uvGrabOffset.current.y;

		console.log('uv grab offset', newPos);

		const updatedUV = new BoxUVMap({
			width: focusedUV.current.width,
			height: focusedUV.current.height,
			depth: focusedUV.current.depth,
		}).setPosition(
			Math.floor(newPos.x / imageScale / 2),
			Math.floor(newPos.y / imageScale / 2)
		);

		//focusedUV.current = updatedUV;

		dispatch(
			meshModifyID({
				id: focusedUV.current.cubeID,
				uv: updatedUV.toUVMap(128, 128) as any,
			})
		);
	};

	return (
		<canvas
			className="pointer-events-auto flex h-full w-full rounded-md border-2 border-black bg-black"
			style={{ imageRendering: 'pixelated' }}
			ref={(canvas) => {
				if (canvas) {
					canvasRef.current = canvas;
					const context = canvas.getContext('2d');
					if (context) {
						context.imageSmoothingEnabled = false;
						drawCanvas(context);
					}
				}
			}}
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
			}}
		>
			Your browser does not support the HTML5 canvas tag.
		</canvas>
	);
};

export default TextureCanvas;

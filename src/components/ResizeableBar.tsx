import React, { useRef, useState } from "react";
import { useRaf } from "react-use";

const ResizeableBar: React.FC<
	{
		id?: string;
		width?: number;
		height?: number;
		resizable: [boolean, boolean, boolean, boolean];
		// resizable: left, top, right, bottom
		className?: string;
	} & React.HTMLAttributes<HTMLDivElement>
> = ({ children, id, width = 96, resizable, className, ...props }) => {
	const [isResizing, setIsResizing] = useState(false);
	const isBorder = useRef([false, false, false, false]);
	const borderMargin = useRef(8);
	const ref = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: MouseEvent) => {};
	const handleMouseUp = () => {
		//console.log("MOUSE UP");
		setIsResizing(false);
	};

	const handleMouseDown = (e: MouseEvent) => {
		console.log("MOUSE DOWN");

		var width = ref.current?.offsetWidth;
		var height = ref.current?.offsetHeight;
		var x = e.clientX - ref.current?.getBoundingClientRect().left;
		var y = e.clientY - ref.current?.getBoundingClientRect().top;

		if (ref.current) {
			const rect = ref.current?.getBoundingClientRect();
			if (
				e.clientX >= rect.left &&
				e.clientX <= rect.right &&
				e.clientY >= rect.top &&
				e.clientY <= rect.bottom
			) {
				console.log("x: ", x, "y: ", y);
				console.log("INSIDE");
				if (isBorderCheck(x, y, width, height)[0]) {
					console.log("LEFT");
					setIsResizing(true);
				} else if (isBorderCheck(x, y, width, height)[1]) {
					console.log("TOP");
					setIsResizing(true);
				} else if (isBorderCheck(x, y, width, height)[2]) {
					console.log("RIGHT");
					setIsResizing(true);
				} else if (isBorderCheck(x, y, width, height)[3]) {
					console.log("BOTTOM");
					setIsResizing(true);
				}
			}
		}
	};
	React.useEffect(() => {
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousedown", handleMouseMove);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, []);

	const isBorderCheck = (x: number, y: number, width: number, height: number) => {
		// is already resizing, return the current border
		if (isResizing) return isBorder.current;

		return [
			resizable[0] && x <= borderMargin.current && y >= 5 && y <= height - 5, //left
			resizable[1] && y <= 5 && x >= 5 && x <= width - 5, //top
			resizable[2] && x >= width - 5 && y >= 5 && y <= height - 5, //right
			resizable[3] && y >= height - 5 && x >= 5 && x <= width - 5, //bottom
		];
	};

	return (
		<div
			id={id}
			ref={ref}
			onMouseOver={(e) => {
				var div = e.currentTarget;
				var width = div.offsetWidth;
				var height = div.offsetHeight;
				var x = e.clientX - div.getBoundingClientRect().left;
				var y = e.clientY - div.getBoundingClientRect().top;
				isBorder.current = isBorderCheck(x, y, width, height);
				if (isBorder.current[0]) {
					div.style.cursor = "w-resize";
				} else if (isBorder.current[1]) {
					div.style.cursor = "n-resize";
				} else if (isBorder.current[2]) {
					div.style.cursor = "e-resize";
				} else if (isBorder.current[3]) {
					div.style.cursor = "s-resize";
				} else {
					div.style.cursor = "default";
				}
			}}
			{...props}
			onMouseUp={() => {
				setIsResizing(false);
				borderMargin.current = 5;
			}}
			style={{ width: `${width}px`, resize: "horizontal" }}
			className={` transition-border duration-100 select-text min-w-10 h-auto w-auto flex flex-col p-5 bg-secondary items-stretch justify-center rounded-xl space-y-2 flex-shrink-0 ${
				(isResizing
					? "select-none border-highlight-300 border-8 p-2 pointer-events-auto z-10"
					: "") +
				(isBorder.current[2] ? "border-r-highlight-100" : "") +
				(isBorder.current[0] ? "border-l-highlight-100" : "") +
				(isBorder.current[1] ? "border-t-highlight-100" : "") +
				(isBorder.current[3] ? "border-b-highlight-100" : "")
			} ${className}`}>
			<div
				className={`w-full h-full justify-center items-start space-y-2 rounded-xl overflow-show 
					"pointer-events-none"
				`}>
				{children}
			</div>
		</div>
	);
};

export default ResizeableBar;

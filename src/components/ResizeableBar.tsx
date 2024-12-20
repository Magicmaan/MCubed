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
	const borderMargin = useRef(5);
	const handleMouseMove = (e: MouseEvent) => {
		if (!isResizing) return;
		// use requestAnimationFrame to throttle the events to stop lag
		requestAnimationFrame(() => {
			const div = document.getElementById(id || "");
			if (div) {
				div.style.userSelect = "none";
				const currentWidth =
					div.getBoundingClientRect().right - div.getBoundingClientRect().left;
				const currentHeight =
					div.getBoundingClientRect().bottom - div.getBoundingClientRect().top;
				//console.log("currentWidth", currentWidth);
				//console.log("currentHeight", currentHeight);
				//left
				if (isBorder.current[0]) {
					var newWidth = div.getBoundingClientRect().left - e.clientX + div.offsetWidth;
					console.log("LEFT RESIZE");
					if (resizable[0]) {
						div.style.width = `${newWidth}px`;
					}
				}
				// top
				if (isBorder.current[1]) {
					const newHeight =
						div.offsetHeight - (e.clientY - div.getBoundingClientRect().top);
					const newTop = e.clientY - div.getBoundingClientRect().top + div.offsetTop;
					console.log("TOP RESIZE");
					if (resizable[1]) {
						div.style.top = `${newTop}px`;
						div.style.height = `${newHeight}px`;
					}
				}
				// right
				//TO FIX CUS FUCK THIS
				if (isBorder.current[2]) {
					var newWidth = e.clientX - div.getBoundingClientRect().right + div.offsetWidth;
					var newLeft = e.clientX - div.getBoundingClientRect().right + div.offsetLeft;
					console.log("RIGHT RESIZE");
					console.log("newWidth", newWidth);
					console.log("NEWlEFT", newLeft);
					if (resizable[2]) {
						//div.style.left = `${newLeft}px`;
						//div.style.width = `-${newLeft}px`;
						div.style.width = `${newWidth}px`;
					}
					//div.style.right = `${newRight}px`;
					//div.style.width = `${newWidth}px`;
				}
				// bottom
				if (isBorder.current[3]) {
					var newHeight =
						div.getBoundingClientRect().bottom -
						div.getBoundingClientRect().top -
						(div.getBoundingClientRect().bottom - e.clientY); // the offset

					console.log("newHeight B", newHeight);
					//newHeight += 5;
					if (resizable[3]) {
						div.style.height = `${newHeight}px`;
					}
				}
			}
		});
	};
	const handleMouseUp = () => {
		console.log("MOUSE UP");
		setIsResizing(false);
	};
	React.useEffect(() => {
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing]);
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
			onMouseDown={(e) => {
				borderMargin.current = 100;
				var div = e.currentTarget;
				var width = div.offsetWidth;
				var height = div.offsetHeight;
				var x = e.clientX - div.getBoundingClientRect().left;
				var y = e.clientY - div.getBoundingClientRect().top;
				isBorder.current = isBorderCheck(x, y, width, height);
				if (isBorder.current.includes(true)) {
					div.style.cursor = "ew-resize";
					setIsResizing(true);
				}
			}}
			{...props}
			onMouseUp={() => {
				setIsResizing(false);
				borderMargin.current = 5;
			}}
			style={{ width: `${width}px`, resize: "horizontal" }}
			className={` transition-border duration-100 select-text min-w-10 h-auto w-auto flex flex-col p-1 bg-secondary items-stretch justify-center rounded-xl space-y-2 flex-shrink-0 ${
				(isResizing ? "select-none border-highlight-300 border-8 p-2 " : "") +
				(isBorder.current[2] ? "border-r-highlight-100" : "") +
				(isBorder.current[0] ? "border-l-highlight-100" : "") +
				(isBorder.current[1] ? "border-t-highlight-100" : "") +
				(isBorder.current[3] ? "border-b-highlight-100" : "")
			} ${className}`}>
			<div
				className={`w-full h-full justify-center items-start space-y-2 rounded-xl overflow-show ${
					isResizing ? "select-none pointer-events-none" : "pointer-events-auto"
				}`}>
				{children}
			</div>
		</div>
	);
};

export default ResizeableBar;

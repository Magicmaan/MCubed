import React from "react";
import SideBarWidget from "./templates/SideBarWidget";
import { useMeshSelector, useViewportSelector } from "../hooks/useRedux";

const TextureCanvasView: React.FC = () => {
	const viewportStore = useViewportSelector();
	const meshStore = useMeshSelector();

	const texture = meshStore.texture[0];

	return (
		<SideBarWidget name={"Texture: " + texture.name}>
			<div className="p-1 bg-red-200 rounded-lg flex-col flex flex-nowrap select-none pointer-events-none gap-1">
				<canvas
					className="w-full aspect-[1.25] border-2 border-black rounded-md"
					ref={(canvas) => {
						if (canvas) {
							const ctx = canvas.getContext("2d");
							if (ctx) {
								ctx.fillStyle = "red";
								ctx.fillRect(0, 0, 100, 100);
							}
						}
					}}>
					Your browser does not support the HTML5 canvas tag.
				</canvas>

				<div className="w-full h-10 bg-red-500 rounded-sm"></div>
			</div>
		</SideBarWidget>
	);
};

export default TextureCanvasView;

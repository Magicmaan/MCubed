import React from "react";
import { CubeProps } from "../primitives/Cube";

type ViewportContextType = {
	camera: {
		pos?: [Number, Number, Number]; // position of camera
		rot?: [Number, Number]; // 2 axis of rotation on camera
		zoom?: Number; // zoom level of camera
		pivot?: [Number, Number, Number]; // pivot point of camera
		projection?: "perspective" | "orthographic" | "Cube"; // camera projection

		props?: any; // additional camera properties
	};

	lookAt?: Number; // cube index to look at (if any)
};

const ViewportContext = React.createContext<ViewportContextType>({
	camera: {
		pos: [10, 10, 10],
		rot: [0, 0],
		zoom: 0.5,
		pivot: [0, 0, 0],
		projection: "perspective",
	},
	lookAt: undefined,
});

export { ViewportContext };

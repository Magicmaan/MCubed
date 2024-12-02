import {
	Dispatch,
	createContext,
	useContext,
	ReactNode,
	SetStateAction,
	useMemo,
} from "react";
import { CubeProps } from "../../primitives/Cube";
import useToggle from "../hooks/useToggle";

type ViewportContextType = {
	camera: {
		pos?: [number, number, number]; // position of camera
		rot?: [number, number]; // 2 axis of rotation on camera
		zoom?: number; // zoom level of camera
		pivot?: [number, number, number]; // pivot point of camera
		projection?: "perspective" | "orthographic" | "Cube"; // camera projection
		fov?: number; // field of view
		props?: any; // additional camera properties
	};

	lookAt?: number; // cube index to look at (if any)
	background?: string; // background colour of viewport

	cameraLock?: [boolean, any]; // lock camera to object
};

const defaultViewportContext: ViewportContextType = {
	camera: {
		pos: [10, 10, 10],
		rot: [0, 0],
		zoom: 0.5,
		pivot: [0, 0, 0],
		projection: "perspective",
		fov: 75,
	},
	lookAt: undefined,
	background: "#000000",
	cameraLock: [false, () => {}],
};

const viewportContext = createContext<ViewportContextType>(defaultViewportContext);
const useViewportContext = () => useContext(viewportContext);

function ViewportContextProvider({
	children,
	data,
}: {
	children: ReactNode;
	data: ViewportContextType;
}) {
	const memoizedData = useMemo(() => data, [data]);
	return (
		<viewportContext.Provider value={memoizedData}>{children}</viewportContext.Provider>
	);
}

export {
	viewportContext,
	ViewportContextProvider,
	useViewportContext,
	defaultViewportContext,
};

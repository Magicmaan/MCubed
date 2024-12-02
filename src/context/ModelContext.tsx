import {
	Dispatch,
	createContext,
	useContext,
	ReactNode,
	SetStateAction,
	useMemo,
} from "react";
import { CubeProps } from "../primitives/Cube";
import * as THREE from "three";

type ModelContextType = {
	model: CubeProps[]; // array of model parts
	set: Dispatch<SetStateAction<CubeProps[]>>; // function to set the model / modify
	selected?: Number[]; // array of selected model parts
	setSelected?: Dispatch<SetStateAction<Number[]>>; // function to set the selected model parts
	count?: Number; // count of model parts
	sceneRef?: THREE.Scene | null; // reference to the React Three scene
	setSceneRef?: Dispatch<SetStateAction<React.MutableRefObject<THREE.Scene | null>>>;
};

// Holds data for the model
// Since all objects are cubes, we can use an array of CubeProps and then assemble it on render / when needed
const modelContext = createContext({
	model: [], // array of model parts
	set: () => {}, // function to set the model / modify
	selected: [0, 1, 2, 3, 4], // array of selected model parts
	setSelected: () => {}, // function to set the selected model parts
	sceneRef: null, // initialize the scene reference to undefined
	setSceneRef: () => {}, // function to set the scene reference
} as ModelContextType);

const useModelContext = () => useContext(modelContext);

// Provides the model context to children
function ModelContextProvider({
	children,
	data,
}: {
	children: ReactNode;
	data: ModelContextType;
}) {
	data.count = data.model.length;
	// Memoize the data to prevent unnecessary re-renders when the data changes
	const memoizedData = useMemo(() => data, [data]);

	return <modelContext.Provider value={memoizedData}>{children}</modelContext.Provider>;
}

export { modelContext, ModelContextProvider, useModelContext };

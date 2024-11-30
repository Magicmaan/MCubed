import { Dispatch, createContext, useContext, ReactNode, SetStateAction } from "react";
import { CubeProps } from "../primitives/Cube";

type ModelContextType = {
	model: CubeProps[]; // array of model parts
	set: Dispatch<SetStateAction<CubeProps[]>>; // function to set the model / modify
	selected?: Number[]; // array of selected model parts
	count?: Number; // count of model parts
};

// Holds data for the model
// Since all objects are cubes, we can use an array of CubeProps and then assemble it on render / when needed
const modelContext = createContext({
	model: [], // array of model parts
	set: () => {}, // function to set the model / modify
	selected: [], // array of selected model parts
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
	return <modelContext.Provider value={data}>{children}</modelContext.Provider>;
}

export { modelContext, ModelContextProvider, useModelContext };

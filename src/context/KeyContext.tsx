import {
	Dispatch,
	createContext,
	useContext,
	ReactNode,
	SetStateAction,
	useState,
} from "react";

// Define the shape of the context data
interface KeyContextType {
	key: string;
	setKey: (key: string) => void;
}

// Create the context with a default value
const KeyContext = createContext<KeyContextType | undefined>(undefined);

// Create a provider component
const KeyContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [key, setKey] = useState<string>("");
	return <KeyContext.Provider value={{ key, setKey }}>{children}</KeyContext.Provider>;
};

// Create a custom hook to use the KeyContext
const useKeyContext = (): KeyContextType => {
	const context = useContext(KeyContext);
	if (context === undefined) {
		throw new Error("useKey must be used within a KeyProvider");
	}
	return context;
};

export { KeyContext, KeyContextProvider, useKeyContext };

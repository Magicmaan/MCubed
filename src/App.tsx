import { useState } from "react";
import "./styles/App.css";
import * as React from "react";
import ModelView from "./pages/ModelView";
import NavBar from "./components/NavBar";
import { KeyContextProvider } from "./context/KeyContext";

function App() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);

	const [currentView, setCurrentView] = useState(<ModelView />);
	return (
		<React.Fragment>
			<NavBar />
			{currentView}
		</React.Fragment>
	);
}

export default App;

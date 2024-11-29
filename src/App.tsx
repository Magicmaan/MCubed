import { useState } from "react";
import "./App.css";
import * as React from "react";
import ModelView from "./pages/ModelView";
import NavBar from "./components/NavBar";

function App() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);

	const [currentView, setCurrentView] = useState(<ModelView />);

	return (
		<>
			<NavBar />
			{currentView}
		</>
	);
}

export default App;

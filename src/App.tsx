import { useState } from 'react';
import './styles/App.css';
import * as React from 'react';
import ModelView from './pages/ModelView';
import NavBar from './components/NavBar';
import { Provider } from 'react-redux';
import store from './store'; // Import the store

function App() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);

	//file stuff to be added
	const [File, setFile] = useState(false);
	var showStartup = useState(false);
	var blurApp = useState(false);
	var showSAnim = useState(false);

	const [currentView, setCurrentView] = useState(<ModelView />);
	return (
		<Provider store={store}>
			<div className="dark flex h-screen w-screen flex-col flex-nowrap transition-all duration-300">
				<NavBar />
				{currentView}
			</div>

			{showStartup[0] && (
				<div
					aria-expanded={showStartup[0]}
					className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-500 aria-expanded:opacity-100"
				>
					<div className="rounded-lg bg-black p-4 drop-shadow-lg">
						<h1>File</h1>
						<button
							onClick={() => {
								showStartup[1](false);
							}}
						>
							Close
						</button>
					</div>
				</div>
			)}
		</Provider>
	);
}

export default App;

import { useState } from 'react';
import './styles/App.css';
import * as React from 'react';
import ModelView from './pages/ModelView';
import NavBar from './components/NavBar';
import { Provider } from 'react-redux';
import store from './redux/store'; // Import the store
import {
	AlertDialog,
	AlertDialogPortal,
	AlertDialogOverlay,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from './components/ui/alert-dialog';
import { Button } from './components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { useLocalStorage } from 'react-use';

import Startup from './components/Startup';
import TextureView from './pages/TextureView';

function App() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);

	//file stuff to be added
	const [File, setFile] = useState(false);
	var [isStartup, setStartup] = React.useState(true);
	var blurApp = useState(false);
	var showSAnim = useState(false);

	const [currentView, setCurrentView] = useState<JSX.Element>(<ModelView />);

	var sp = new URLSearchParams(window.location.search);



	return (
		<Provider store={store}>
			<div className="dark flex h-screen w-screen flex-col flex-nowrap transition-all duration-300">
				<NavBar
					view={currentView}
					setView={(state: 'model' | 'texture') => {
						if (state === 'model') {
							setCurrentView(<ModelView />);
						} else {
							setCurrentView(<TextureView />);
						}
					}}
				/>
				{currentView}

				{isStartup && <Startup setStartup={setStartup} />}
			</div>
		</Provider>
	);
}

export default App;

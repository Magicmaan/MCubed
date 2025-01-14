import { useState } from 'react';
import './styles/App.css';
import * as React from 'react';
import ModelView from './pages/ModelView';
import NavBar from './components/NavBar';
import { Provider } from 'react-redux';
import store from './store'; // Import the store
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

function App() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);

	//file stuff to be added
	const [File, setFile] = useState(false);
	var [isStartup, setStartup] = React.useState(true);
	var blurApp = useState(false);
	var showSAnim = useState(false);

	const [currentView, setCurrentView] = useState(<ModelView />);

	var sp = new URLSearchParams(window.location.search);
	console.log(sp.get('j'));

	const [val, setVal, remove] = useLocalStorage('test');
	console.log(val);

	console.log(localStorage);

	return (
		<Provider store={store}>
			<div className="dark flex h-screen w-screen flex-col flex-nowrap transition-all duration-300">
				<NavBar />
				{currentView}

				{isStartup && <Startup setStartup={setStartup} />}
			</div>
		</Provider>
	);
}

export default App;

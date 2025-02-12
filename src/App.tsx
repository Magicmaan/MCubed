import { useState } from 'react';
import './styles/App.css';
import * as React from 'react';
import ModelView from './pages/ModelView';
import NavBar from './components/NavBar';
import { Provider } from 'react-redux';
import store, { AppDispatch } from './redux/store'; // Import the store
import { v4 as uuidv4 } from 'uuid';
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
import { loadBBModelToMesh } from './util/fileUtil';
import { useMeshStoreSelector } from './hooks/useRedux';
import { useDispatch, useSelector } from 'react-redux';
import { loadMesh, saveMeshCache } from './redux/reducers/meshReducer';
import { get } from 'http';
import {
	getLocalStorage,
	getSessionStorage,
	setSessionStorage,
} from './storage/localStorage';

function App() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);

	//file stuff to be added
	const [fileLoaded, setFileLoaded] = useState(false);
	var [isStartup, setStartup] = React.useState(true);

	const [currentView, setCurrentView] = useState<JSX.Element>(<ModelView />);

	//need to do alternate means since outside Provider
	const dispatch = store.dispatch as AppDispatch;
	const meshStore = store.getState().mesh;

	// store.dispatch( loadMesh( newState));
	const generateSessionStorage = () => {
		const id = meshStore.key;
		const storeJSON = JSON.stringify(meshStore);
		if (id && storeJSON) {
			dispatch(saveMeshCache());
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set('id', id);
			window.history.replaceState(null, '', newUrl.toString());
		}
	};

	//url parameters
	React.useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const idParam = params.get('id');

		if (idParam) {
			// first check session storage, then local storage
			// get data and load
			const paramData =
				getSessionStorage(idParam) || getLocalStorage(idParam) || '{}';
			const data = JSON.parse(paramData);
			if (data && data.mesh) {
				console.log('Loaded from URL', data);
				dispatch(loadMesh(data));
			} else {
				console.log('No data found at URL');
				// generate new temp storage
				generateSessionStorage();
			}
		} else {
			generateSessionStorage();
		}
	}, []);

	// interval to save to session storage
	React.useEffect(() => {
		const intervalId = setInterval(() => {
			dispatch(saveMeshCache());
			console.log('Saved to session storage');
		}, 10000); // 10000 milliseconds = 10 seconds
		return () => clearInterval(intervalId); // Cleanup interval on component unmount
	}, []);

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

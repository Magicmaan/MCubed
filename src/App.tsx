import { useState } from 'react';
import './styles/App.css';
import * as React from 'react';
import ModelView from './pages/ModelView';
import NavBar from './components/NavBar';
import { Provider } from 'react-redux';
import store, { AppDispatch } from './redux/store'; // Import the store
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
import { loadMesh } from './redux/reducers/meshReducer';
import { get } from 'http';
import { getLocalStorage } from './storage/localStorage';

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

	//url parameters
	React.useEffect(() => {
		const params = new URLSearchParams(window.location.search);

		const idParam = params.get('id');

		if (idParam) {
			const data = JSON.parse(getLocalStorage(idParam) ?? '{}');
			if (data && data.mesh) {
				console.log('Loaded from URL', data);
				dispatch(loadMesh(data));
			} else {
				console.log('No data found at URL');
			}
		}
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

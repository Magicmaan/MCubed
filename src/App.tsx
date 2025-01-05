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

function App() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = React.useState(true);

	//file stuff to be added
	const [File, setFile] = useState(false);
	var [isStartup, setStartup] = React.useState(true);
	var blurApp = useState(false);
	var showSAnim = useState(false);

	const [currentView, setCurrentView] = useState(<ModelView />);
	return (
		<Provider store={store}>
			<div className="dark flex h-screen w-screen flex-col flex-nowrap transition-all duration-300">
				<NavBar />
				{currentView}

				{isStartup && (
					<div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
						<Card className="dark:bg-popup-bg flex h-1/2 w-1/2 flex-col justify-between overflow-hidden">
							<CardHeader>
								<CardTitle>Create Project</CardTitle>
							</CardHeader>
							<CardContent className="flex h-auto max-h-full flex-grow flex-row items-stretch justify-stretch gap-4">
								<ScrollArea className="flex h-full w-auto flex-col flex-nowrap rounded-md p-1">
									<Button
										className="m-0 flex w-32 justify-start text-start"
										variant={'outline'}
										onClick={(e) => {
											setStartup(false);
										}}
									>
										Cube Model
									</Button>
									<Button
										className="m-0 flex w-32 justify-start text-start"
										variant={'outline'}
										onClick={(e) => {
											setStartup(false);
										}}
									>
										Mesh Model
									</Button>
								</ScrollArea>
								<div className="flex h-full w-auto flex-grow flex-row gap-4 rounded-md border-[1px] border-white bg-red-500">
									hi
								</div>
							</CardContent>
							<CardFooter>
								<Button
									variant={'default'}
									onClick={(e) => {
										setStartup(false);
									}}
								>
									Close
								</Button>
							</CardFooter>
						</Card>
					</div>
				)}
			</div>
		</Provider>
	);
}

export default App;

import React from 'react';
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from './ui/card';

import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import {
	clearLocalStorage,
	getLocalStorage,
	getLocalStorageKeys,
	setLocalStorage,
} from '../storage/localStorage';
import { v4 as uuidv4 } from 'uuid';
import {
	useAppDispatch,
	useMeshDataSelector,
	useMeshStoreSelector,
} from '../hooks/useRedux';
import { get } from 'http';
import {
	loadMesh,
	MeshState,
	MeshStateSerialised,
	reset,
} from '../redux/reducers/meshReducer';
import { MenubarSeparator } from './ui/menubar';
import Icon from '../assets/icons/solid/.all';
import { getMeshStorage, serialiseMeshState } from '../storage/meshStorage';
import { toFormatted } from '../util/dateUtil';
import { getData, loadBBModelToMesh } from '../util/fileUtil';
import { text } from 'stream/consumers';
import { BBModelFile } from '../types/types';

const Startup: React.FC<{
	setStartup: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setStartup }) => {
	//clearLocalStorage();

	const dispatch = useAppDispatch();
	const meshStore = useMeshStoreSelector();

	const storageValues = getMeshStorage();

	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<Card className="flex h-1/2 min-h-[36rem] w-1/2 min-w-[46rem] flex-col justify-between overflow-hidden shadow-md shadow-black dark:bg-popup-bg">
				<CardHeader>
					<CardTitle>Create Project</CardTitle>
				</CardHeader>
				<CardContent className="flex h-40 max-h-full w-full flex-grow flex-row items-stretch justify-stretch gap-4">
					<ScrollArea className="flex h-full w-52 flex-col flex-nowrap rounded-md bg-red-500 p-1">
						<Button
							className="m-0 flex w-full justify-start rounded-sm text-start"
							variant={'outline'}
							onClick={(e) => {
								dispatch(reset());
								setStartup(false);
							}}
						>
							Cube Model
						</Button>

						<div className="flex h-full w-10 grow"></div>
						<MenubarSeparator />
						<div className="flex h-full w-10 grow"></div>

						<Button
							className="m-0 flex w-full justify-start text-start"
							variant={'outline'}
							onClick={() => {
								const input = document.getElementById(
									'file_selector'
								) as HTMLInputElement;
								input.click();
							}}
						>
							Open
							{/* need an input to actually get file */}
							<input
								id="file_selector"
								type="file"
								accept=".bbmodel"
								onChange={(e) => {
									const file = e.target.files?.[0];

									if (file) {
										let data: BBModelFile;
										getData(file).then((d) => {
											data = JSON.parse(d) as BBModelFile;
										});

										console.log(
											'Selected file path:',
											file
										);
										loadBBModelToMesh(file).then(
											(meshState) => {
												dispatch(loadMesh(meshState));
												setStartup(false);

												console.log('Loaded file');
											}
										);
									}
								}}
								hidden
							/>
						</Button>

						{/* Open Model */}

						{/* Repeat the Button component as needed */}
					</ScrollArea>

					<ScrollArea className="flex h-full w-full flex-col flex-nowrap rounded-md bg-red-500 p-1">
						{storageValues.map((value, index) => {
							if (value) {
								return (
									<>
										<Button
											variant={'outline'}
											// className="flex w-full flex-col items-start justify-between rounded-md p-1 hover:bg-button-hover"
											className="flex w-full"
											onMouseDown={(e) => {
												console.log('Loaded', value);
												dispatch(loadMesh(value));
												const url = new URL(
													window.location.href
												);
												url.searchParams.set(
													'id',
													value.key
												);
												window.history.pushState(
													{},
													'',
													url.toString()
												);
												setStartup(false);
											}}
										>
											<p>{value.name}</p>
											<div className="flex h-4 w-full flex-row items-center justify-start bg-transparent pl-1 text-sm text-gray-400">
												<p>
													{toFormatted(
														new Date(
															value.lastModified
														)
													)}
												</p>
											</div>
										</Button>
										<MenubarSeparator />
									</>
								);
							}
						})}
					</ScrollArea>
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
	);
};

export default Startup;

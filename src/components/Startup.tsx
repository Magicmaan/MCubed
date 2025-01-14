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
import { useMeshDataSelector, useMeshStoreSelector } from '../hooks/useRedux';
import { get } from 'http';
import { MeshState, MeshStateSerialised } from '../reducers/meshReducer';
import { MenubarSeparator } from './ui/menubar';
import Icon from '../assets/icons/solid/.all';

const serialiseMeshState = (meshState: MeshState): string => {
	return JSON.stringify({
		creationDate: Date.now(),
		lastModified: Date.now(),
		...meshState,
	} as MeshStateSerialised);
};

const Startup: React.FC<{
	setStartup: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setStartup }) => {
	//clearLocalStorage();

	const meshStore = useMeshStoreSelector();

	setLocalStorage(uuidv4(), serialiseMeshState(meshStore));

	const storageKeys = getLocalStorageKeys();
	const storageValues = storageKeys.map((key) => {
		const data = getLocalStorage(key);
		if (data) {
			const obj = JSON.parse(data) as MeshStateSerialised;
			console.log(obj);
			return obj;
		}
	});
	storageValues
		.sort((a, b) => {
			return a.creationDate - b.creationDate;
		})
		.reverse();

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
								setStartup(false);
							}}
						>
							Cube Model
						</Button>
						<Button
							className="m-0 flex w-full justify-start text-start"
							variant={'outline'}
							onClick={(e) => {
								setStartup(false);
							}}
						>
							Mesh Model
						</Button>
						{/* Repeat the Button component as needed */}
					</ScrollArea>

					<ScrollArea className="flex h-full w-full flex-col flex-nowrap rounded-md bg-red-500 p-1">
						{storageValues.map((value, index) => {
							if (value) {
								return (
									<>
										<div className="flex flex-col items-start justify-between p-1">
											<p>{value.name}</p>
											<div className="flex h-4 w-full flex-row items-center justify-start bg-blue-500">
												<Icon
													name="clock"
													width={16}
													height={16}
												/>
												<p>
													{(() => {
														const modifiedDate =
															new Date(
																value.lastModified
															);
														const now = new Date();
														const diff =
															now.getTime() -
															modifiedDate.getTime();
														const diffMinutes =
															Math.floor(
																diff /
																	(1000 * 60)
															);
														const diffHours =
															Math.floor(
																diff /
																	(1000 *
																		60 *
																		60)
															);
														const diffDays =
															Math.floor(
																diff /
																	(1000 *
																		60 *
																		60 *
																		24)
															);
														if (diffMinutes < 60) {
															return `${diffMinutes} minutes ago`;
														} else if (
															diffHours < 24
														) {
															return `${diffHours} hours ago`;
														} else if (
															diffDays === 0
														) {
															return 'Today';
														} else if (
															diffDays === 1
														) {
															return 'Yesterday';
														} else {
															return `${diffDays} days ago`;
														}
													})()}
												</p>
											</div>
										</div>
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

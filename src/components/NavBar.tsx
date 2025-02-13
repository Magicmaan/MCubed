import { useState } from 'react';
import * as React from 'react';
import {
	NavButton,
	NavChildButton,
	NavChildCheck,
	NavChildItem,
} from './NavButton';
import '../styles/App.css';
import {
	useAppDispatch,
	useMeshStoreSelector,
	useViewportSelector,
} from '../hooks/useRedux';
import {
	toggleGrid,
	toggleStats,
	toggleWorldGrid,
} from '../redux/reducers/viewportReducer';
import { RootState } from '../redux/store';
import { connect, useDispatch } from 'react-redux';
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarTrigger,
} from './ui/menubar';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

import { Button } from './ui/button';
import ErrorAlert from './templates/ErrorAlert';
import { exportScene, saveMesh, setName } from '../redux/reducers/meshReducer';
import { setLocalStorage } from '../storage/localStorage';

const styles = {
	menubar: `dark rounded-none outline-none dark:bg-matisse-950 p-1 pt-0 dark:border-matisse-900`,
	menubarTrigger: `text-md rounded-none dark:bg-matisse-950 dark:hover:bg-button-hover h-full dark:focus:bg-button-selected dark:focus:active:bg-button-selected`,
	menubarContent: `dark rounded-sm dark:bg-popup-bg `,
	menubarSeparator: `m-0 h-6 w-0.5 bg-secondary-500 p-0`,
	menuItem: `dark:hover:bg-button-selected dark:focus:bg-button-selected`,
};

import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from './ui/card';
import { PopoverContent, PopoverTrigger, Popover } from './ui/popover';
import { Input } from './ui/input';

const ProjectInfo: React.FC = () => {
	const meshStore = useMeshStoreSelector();
	const viewportData = useViewportSelector();
	const dispatch = useAppDispatch();

	return (
		<Card className="flex min-h-[36rem] w-24 min-w-[46rem] flex-col justify-between overflow-hidden shadow-md shadow-black dark:bg-popup-bg">
			<CardHeader>
				<CardTitle>Project</CardTitle>
			</CardHeader>
			<CardContent className="flex h-40 max-h-full w-full flex-grow flex-row items-stretch justify-stretch gap-4">
				<Input
					className="flex w-1/2 bg-transparent dark:bg-opacity-50"
					type="text"
					placeholder={'Project Name'}
					onChange={(e) => {
						dispatch(setName(e.target.value));
					}}
					onKeyDownCapture={(e) => {
						if (e.key === 'Enter') {
							e.currentTarget.blur();
						}
					}}
				/>
			</CardContent>
			<CardFooter>
				<Button variant={'default'}>Close</Button>
			</CardFooter>
		</Card>
	);
};

const NavBar: React.FC<{
	view: JSX.Element;
	setView: (state: 'model' | 'texture') => void;
}> = ({ view, setView }) => {
	const hasOpened = useState(false);
	const currentButton = useState('');
	const viewportData = useViewportSelector();
	const meshStore = useMeshStoreSelector();
	const dispatch = useAppDispatch();

	return (
		<Menubar className={styles.menubar + ' border-0 border-b-4'}>
			<MenubarMenu>
				<MenubarTrigger className={styles.menubarTrigger}>
					File
				</MenubarTrigger>
				<MenubarContent className={styles.menubarContent}>
					<MenubarItem className={styles.menuItem}>
						New Tab <MenubarShortcut>⌘T</MenubarShortcut>
					</MenubarItem>
					<MenubarItem className={styles.menuItem}>
						New Window
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem
						className={styles.menuItem}
						onClick={(e) => {
							dispatch(saveMesh());
							console.log('Saved');
							e.preventDefault();
						}}
					>
						Save
					</MenubarItem>
					<MenubarItem
						className={styles.menuItem}
						onClick={(e) => {
							dispatch(exportScene());
							console.log('Exporting scene');
							e.preventDefault();
						}}
					>
						Export
					</MenubarItem>
					<MenubarItem className={styles.menuItem}>Share</MenubarItem>
					<MenubarSeparator />
					<MenubarItem className={styles.menuItem}>Print</MenubarItem>
				</MenubarContent>
			</MenubarMenu>

			<MenubarSeparator className="m-0 h-6 w-0.5 bg-secondary-500 p-0"></MenubarSeparator>

			<MenubarMenu>
				<MenubarTrigger className={styles.menubarTrigger}>
					Project
				</MenubarTrigger>
				<MenubarContent className={styles.menubarContent}>
					<Popover>
						<PopoverTrigger
							className={
								styles.menuItem +
								'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-neutral-100 focus:text-neutral-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:bg-transparent dark:focus:bg-neutral-800 dark:focus:text-neutral-50'
							}
						>
							Info
						</PopoverTrigger>
						<PopoverContent className="dark pointer-events-auto absolute left-0 top-0 h-screen w-screen border-none bg-transparent shadow-none drop-shadow-none dark:bg-transparent">
							<ProjectInfo />
						</PopoverContent>
					</Popover>
					<MenubarSeparator />
				</MenubarContent>
			</MenubarMenu>

			<MenubarSeparator className="m-0 h-6 w-0.5 bg-secondary-500 p-0"></MenubarSeparator>
			<MenubarMenu>
				<MenubarTrigger className={styles.menubarTrigger}>
					Edit
				</MenubarTrigger>
				<MenubarContent className={styles.menubarContent}>
					<MenubarItem className={styles.menuItem}>
						New Tab <MenubarShortcut>⌘T</MenubarShortcut>
					</MenubarItem>
					<MenubarItem className={styles.menuItem}>
						New Window
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem className={styles.menuItem}>Share</MenubarItem>
					<MenubarSeparator />
					<MenubarItem className={styles.menuItem}>Print</MenubarItem>
				</MenubarContent>
			</MenubarMenu>

			<MenubarSeparator className="m-0 h-6 w-0.5 bg-secondary-500 p-0"></MenubarSeparator>

			<MenubarMenu>
				<MenubarTrigger className={styles.menubarTrigger}>
					View
				</MenubarTrigger>
				<MenubarContent className={styles.menubarContent}>
					<MenubarCheckboxItem
						className={styles.menuItem}
						checked={viewportData.showGrid}
						onClick={(e) => {
							dispatch(toggleGrid());
							e.preventDefault();
						}}
					>
						Show Grid
					</MenubarCheckboxItem>
					<MenubarCheckboxItem
						className={styles.menuItem}
						checked={viewportData.showWorldGrid}
						onClick={(e) => {
							dispatch(toggleWorldGrid());
							e.preventDefault();
						}}
					>
						Show World Grid
					</MenubarCheckboxItem>
					<MenubarCheckboxItem
						className={styles.menuItem}
						checked={viewportData.showStats}
						onClick={(e) => {
							dispatch(toggleStats());
							e.preventDefault();
						}}
					>
						Show Stats
					</MenubarCheckboxItem>
				</MenubarContent>
			</MenubarMenu>

			<div className="absolute right-1/2 h-auto w-auto translate-x-1/2 items-center">
				<Tabs
					defaultValue="model"
					className="flex w-44"
					onValueChange={(e) => setView(e as 'model' | 'texture')}
				>
					<TabsList className="flex w-auto justify-evenly gap-2">
						<TabsTrigger value="model">Model</TabsTrigger>
						<TabsTrigger value="texture">Texture</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			<ErrorAlert
				error="This is an error message"
				info="An Error occured "
			/>
		</Menubar>
	);
};

export default NavBar;

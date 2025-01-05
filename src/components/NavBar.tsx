import { useState } from 'react';
import * as React from 'react';
import {
	NavButton,
	NavChildButton,
	NavChildCheck,
	NavChildItem,
} from './NavButton';
import '../styles/App.css';
import { useAppDispatch, useViewportSelector } from '../hooks/useRedux';
import { toggleGrid, toggleStats } from '../reducers/viewportReducer';
import { RootState } from '../store';
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
import { Button } from './ui/button';
import ErrorAlert from './templates/ErrorAlert';

const styles = {
	menubar: `dark rounded-none outline-none dark:bg-matisse-950 p-1 pt-0 dark:border-matisse-900`,
	menubarTrigger: `text-md rounded-none dark:bg-matisse-950 dark:hover:bg-button-hover h-full dark:focus:bg-button-selected dark:focus:active:bg-button-selected`,
	menubarContent: `dark rounded-sm dark:bg-popup-bg `,
	menubarSeparator: `m-0 h-6 w-0.5 bg-secondary-500 p-0`,
	menuItem: `dark:hover:bg-button-selected dark:focus:bg-button-selected`,
};

const NavBar: React.FC = () => {
	const hasOpened = useState(false);
	const currentButton = useState('');
	const viewportData = useViewportSelector();
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
					<MenubarItem className={styles.menuItem}>Share</MenubarItem>
					<MenubarSeparator />
					<MenubarItem className={styles.menuItem}>Print</MenubarItem>
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

			<ErrorAlert
				error="This is an error message"
				info="An Error occured "
			/>
		</Menubar>
	);
};

export default NavBar;

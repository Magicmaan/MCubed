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

const NavBar: React.FC<Props> = () => {
	const hasOpened = useState(false);
	const currentButton = useState('');
	const viewportData = useViewportSelector();
	const dispatch = useAppDispatch();

	return (
		<Menubar className="rounded-none border-none bg-main-600 outline-none">
			<MenubarMenu>
				<MenubarTrigger className="text-md rounded-md hover:bg-button-hover">
					File
				</MenubarTrigger>
				<MenubarContent className="rounded-sm">
					<MenubarItem>
						New Tab <MenubarShortcut>⌘T</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>New Window</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Share</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Print</MenubarItem>
				</MenubarContent>
			</MenubarMenu>

			<MenubarSeparator className="m-0 h-6 w-0.5 bg-secondary-500 p-0"></MenubarSeparator>

			<MenubarMenu>
				<MenubarTrigger className="text-md rounded-md hover:bg-button-hover">
					Edit
				</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						New Tab <MenubarShortcut>⌘T</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>New Window</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Share</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Print</MenubarItem>
				</MenubarContent>
			</MenubarMenu>

			<MenubarSeparator className="m-0 h-6 w-0.5 bg-secondary-500 p-0"></MenubarSeparator>

			<MenubarMenu>
				<MenubarTrigger className="text-md rounded-md hover:bg-button-hover">
					View
				</MenubarTrigger>
				<MenubarContent>
					<MenubarCheckboxItem
						checked={viewportData.showGrid}
						onClick={(e) => {
							dispatch(toggleGrid());
							e.preventDefault();
						}}
					>
						Show Grid
					</MenubarCheckboxItem>
					<MenubarCheckboxItem
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

import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarTrigger,
} from './ui/menubar';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Button } from './ui/button';

const styles = {
	menubar: `dark rounded-none outline-none dark:bg-matisse-950 p-1 pt-0 dark:border-matisse-900`,
	menubarTrigger: `text-md rounded-none dark:bg-matisse-950 dark:hover:bg-button-hover h-full dark:focus:bg-button-selected dark:focus:active:bg-button-selected`,
	menubarContent: `dark rounded-sm dark:bg-popup-bg `,
	menubarSeparator: `m-0 h-6 w-0.5 bg-secondary-500 p-0`,
	menuItem: `dark:hover:bg-button-selected dark:focus:bg-button-selected`,
};

function ProjectInfo() {
	return (
		<Card className="flex min-h-[36rem] w-24 min-w-[46rem] flex-col justify-between overflow-hidden shadow-md shadow-black dark:bg-popup-bg">
			<CardHeader>
				<CardTitle>Project</CardTitle>
			</CardHeader>
			<CardContent className="flex h-40 max-h-full w-full flex-grow flex-row items-stretch justify-stretch gap-4">
				<Input
					className="flex w-1/2 bg-transparent dark:bg-opacity-50"
					type="text"
					placeholder="Project Name"
					onKeyDownCapture={(event) => {
						if (event.key === 'Enter') {
							event.currentTarget.blur();
						}
					}}
				/>
			</CardContent>
			<CardFooter>
				<Button variant="default">Close</Button>
			</CardFooter>
		</Card>
	);
}

function NavBar({
	view,
	setView,
}: {
	view: 'model' | 'texture';
	setView: (state: 'model' | 'texture') => void;
}) {
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
					<MenubarItem className={styles.menuItem}>Save</MenubarItem>
					<MenubarItem className={styles.menuItem}>
						Export
					</MenubarItem>
					<MenubarItem className={styles.menuItem}>Share</MenubarItem>
					<MenubarSeparator />
					<MenubarItem className={styles.menuItem}>Print</MenubarItem>
				</MenubarContent>
			</MenubarMenu>

			<MenubarSeparator className={styles.menubarSeparator} />

			<MenubarMenu>
				<MenubarTrigger className={styles.menubarTrigger}>
					Project
				</MenubarTrigger>
				<MenubarContent className={styles.menubarContent}>
					<Popover>
						<PopoverTrigger
							className={
								styles.menuItem +
								' relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-neutral-100 focus:text-neutral-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:bg-transparent dark:focus:bg-neutral-800 dark:focus:text-neutral-50'
							}
						>
							Info
						</PopoverTrigger>
						<PopoverContent className="dark pointer-events-auto absolute left-0 top-0 h-screen w-screen border-none bg-transparent shadow-none drop-shadow-none dark:bg-transparent">
							<ProjectInfo />
						</PopoverContent>
					</Popover>
				</MenubarContent>
			</MenubarMenu>

			<MenubarSeparator className={styles.menubarSeparator} />

			<MenubarMenu>
				<MenubarTrigger className={styles.menubarTrigger}>
					Edit
				</MenubarTrigger>
				<MenubarContent className={styles.menubarContent}>
					<MenubarItem className={styles.menuItem}>Undo</MenubarItem>
					<MenubarItem className={styles.menuItem}>Redo</MenubarItem>
					<MenubarSeparator />
					<MenubarItem className={styles.menuItem}>Copy</MenubarItem>
					<MenubarItem className={styles.menuItem}>Paste</MenubarItem>
				</MenubarContent>
			</MenubarMenu>

			<div className="absolute right-1/2 h-auto w-auto translate-x-1/2 items-center">
				<Tabs
					value={view}
					className="flex w-44"
					onValueChange={(value) =>
						setView(value as 'model' | 'texture')
					}
				>
					<TabsList className="flex w-auto justify-evenly gap-2">
						<TabsTrigger value="model">Model</TabsTrigger>
						<TabsTrigger value="texture">Texture</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
		</Menubar>
	);
}

export default NavBar;

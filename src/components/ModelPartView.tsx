import Icon from '../assets/icons/solid/.all';
import SideBarWidget from './templates/SideBarWidget';
import { Button } from './ui/button';

function ModelPartView() {
	return (
		<SideBarWidget
			name="Model Part View"
			className="flex h-96 flex-shrink flex-grow"
		>
			<div className="dark pointer-events-auto flex h-auto w-full flex-row items-center justify-between p-1 pb-2">
				<Button
					title="Add Cube"
					className="m-1 aspect-square h-8 w-8 items-center justify-center rounded-sm p-1 text-center dark:bg-main-500 dark:hover:bg-button-hover"
					variant="default"
				>
					<p className="text-2xl leading-none">+</p>
				</Button>
			</div>

			<div className="h-full w-full flex-1 flex-col flex-nowrap items-center justify-center space-y-1 overflow-y-scroll">
				<button
					aria-pressed
					className="pointer-events-auto flex h-10 w-full select-none flex-row flex-nowrap items-center justify-stretch rounded-md bg-secondary hover:bg-button-hover focus:outline-none aria-pressed:bg-button-selected"
				>
					<Icon name="cube" height={16} width={16} colour="red" />
					<span className="px-2 text-sm text-white">Cube</span>
				</button>
			</div>
		</SideBarWidget>
	);
}

export default ModelPartView;

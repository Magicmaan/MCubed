import React from "react";
import { useKey } from "react-use";
import Icon from "../assets/icons/solid/.all";
import { MenuItem } from "../hooks/useContextMenu";

const ContextClick = () => {
	return <div className="bg-green-400 w-full h-full inset-0"></div>;
};

interface ContextMenuProps {
	items: MenuItem[];
	position: { x: number; y: number };
	visible: boolean;
	id?: string;
	hideMenu?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
	items,
	position,
	visible,
	id,
	hideMenu,
}) => {
	var parentElement: HTMLElement | null = null;
	const [parent, setParent] = React.useState<HTMLElement | null>(null);
	useKey("Escape", () => {
		if (hideMenu) hideMenu();
		console.log("Escape key pressed");
	});

	React.useEffect(() => {
		parentElement = document.getElementById(id)?.parentElement || null;
		setParent(parentElement);
		//console.log("Parent", parentElement);
	}, [id]);

	const ItemIcon = ({ icon }: { icon?: string }) => {
		return (
			<>
				{icon ? (
					<Icon name={icon} height={16} width={16} colour="red" />
				) : (
					<Icon name="cube" height={16} width={16} colour="red" />
				)}
			</>
		);
	};

	const MenuButton: React.FC<{
		item: MenuItem;
		hideMenu?: () => void;
	}> = ({ item, hideMenu }) => {
		return (
			<button
				className="
						mx-1 mt-1 p-2 min-w-40 bg-transparent  cursor-pointer 
						justify-center items-center flex flex-col flex-nowrap
						hover:bg-secondary hover:text-white rounded-lg
						h-9 last:mb-1
					"
				onClick={() => {
					item.action();
					if (hideMenu) hideMenu();
				}}>
				<div className="w-full h-auto justify-start flex flex-row flex-nowrap gap-2">
					<ItemIcon icon={item.icon} />
					<div className="text-s flex flex-row flex-nowrap justify-between items-center w-full h-auto pr-1">
						<p>{item.label}</p>
						<p className="bg-secondary aspect-square h-full rounded-md">{item.key}</p>
					</div>
				</div>
			</button>
		);
	};

	const MenuInfo: React.FC<{ label: string }> = ({ label }) => {
		return (
			<div
				className="
					mx-1 mt-1 p-2 min-w-40 bg-red 
					justify-center items-center flex flex-col flex-nowrap
					rounded-md h-9 last:mb-1
				">
				<div className="w-full h-auto justify-start flex flex-row flex-nowrap gap-2 text-xs">
					<ItemIcon icon="cube" />
					{label}
				</div>
			</div>
		);
	};
	return (
		<div
			id={id}
			aria-expanded={visible}
			className="
				absolute min-w-48 h-auto bg-main-700 z-50 expand-element-200 
				rounded-md pointer-events-auto flex flex-col flex-nowrap 
				backdrop-blur-sm  shadow-2xl
			"
			style={{ top: position.y, left: position.x + 5 }}>
			{items.map((item, index) => (
				<React.Fragment key={index}>
					{item.type == "info" ? (
						<MenuInfo label={item.label} />
					) : (
						<MenuButton item={item} hideMenu={hideMenu} />
					)}
				</React.Fragment>
			))}
		</div>
	);
};

export default ContextMenu;
export { ContextClick };

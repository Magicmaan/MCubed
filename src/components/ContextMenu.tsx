import React from "react";
import { useKey, useKeyPress } from "react-use";
import Icon from "../assets/icons/solid/.all";

const ContextClick = () => {
	return <div className="bg-green-400 w-full h-full inset-0"></div>;
};

interface ContextMenuProps {
	items: { label: string; action: () => void; icon?: string }[];
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

	return (
		<div
			id={id}
			aria-expanded={visible}
			className="
				absolute w-auto h-auto bg-secondary bg-opacity-75 z-50 expand-element-200 
				rounded-xl pointer-events-auto flex flex-col flex-nowrap 
				backdrop-blur-sm  shadow-2xl
			"
			style={{ top: position.y, left: position.x + 5 }}>
			{parent?.dataset.contextitems}
			{items.map((item, index) => (
				<button
					key={index}
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
						{item.icon ? (
							<Icon name={item.icon} height={16} width={16} colour="red" />
						) : (
							<Icon name="cube" height={16} width={16} colour="red" />
						)}
						{item.label}
					</div>
				</button>
			))}
		</div>
	);
};

export default ContextMenu;
export { ContextClick };

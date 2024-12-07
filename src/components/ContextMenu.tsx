import React from "react";

const ContextClick = () => {
	return <div className="bg-green-400 w-full h-full inset-0"></div>;
};

interface ContextMenuProps {
	items: { label: string }[];
	position: { x: number; y: number };
	visible: boolean;
	id?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, visible, id }) => {
	var parentElement: HTMLElement | null = null;
	const [parent, setParent] = React.useState<HTMLElement | null>(null);
	React.useEffect(() => {
		parentElement = document.getElementById(id)?.parentElement || null;
		setParent(parentElement);
	}, [id]);

	return (
		<div
			id={id}
			aria-expanded={visible}
			className="absolute w-auto h-auto bg-red-600  expand-element-200 rounded-xl"
			style={{ top: position.y, left: position.x + 5 }}>
			{parent?.dataset.contextitems}
			{items.map((item, index) => (
				<div key={index} className="p-2 hover:bg-gray-200 cursor-pointer ">
					{item.label}
				</div>
			))}
		</div>
	);
};

export default ContextMenu;
export { ContextClick };

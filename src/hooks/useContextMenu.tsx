import { useState, useCallback } from "react";

const useContextMenu = () => {
	const [menuVisible, setMenuVisible] = useState(false);
	const [menuItems, setMenuItems] = useState([
		{ label: "Option 1", action: () => console.log("Option 1 selected") },
		{ label: "Option 2", action: () => console.log("Option 2 selected") },
		// More menu items...
	]);
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

	const showMenu = useCallback((event: React.MouseEvent, items) => {
		event.preventDefault();
		setMenuPosition({ x: event.pageX, y: event.pageY });
		setMenuItems(items);
		setMenuVisible(true);
	}, []);

	const hideMenu = useCallback(() => {
		setMenuVisible(false);
	}, []);

	interface MenuItem {
		label: string;
		action: () => void;
	}

	interface MenuPosition {
		x: number;
		y: number;
	}

	const handleContextMenu = (event: React.MouseEvent, menuItems: MenuItem[]) => {
		var parentElement = document.getElementById(event.target.id)?.parentElement;
		if (menuVisible) {
			event.preventDefault();
			hideMenu();
		} else {
			showMenu(event, JSON.stringify(parentElement?.dataset.contextitems));
		}
	};

	return { menuVisible, menuItems, menuPosition, showMenu, hideMenu, handleContextMenu };
};

export default useContextMenu;

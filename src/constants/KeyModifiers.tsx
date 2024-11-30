const modifiers = {
	ALT: "Alt",
	CTRL: "Control",
	META: "meta",
	SHIFT: "Shift",
};

const modifierIncrement = {
	Alt: 1,
	Meta: 1,
	Control: 0.1,
	Shift: 0.25,

	ShiftControl: 0.01,
	ControlShift: 0.01,
};
export { modifiers, modifierIncrement };

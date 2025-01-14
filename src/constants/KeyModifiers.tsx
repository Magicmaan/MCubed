const modifiers = {
	small_shift: "Shift",
	x_small_shift: "Control",

	xx_small_shift_1: "Control",
	xx_small_shift_2: "Shift",
};

const moveModifierIncrement = {
	mega_shift: 8,
	normal_shift: 1,
	small_shift: 0.25,
	x_small_shift: 0.1,
	xx_small_shift: 0.01,
};
const rotateModifierIncrement = {
	mega_shift: 8,
	normal_shift: 2.5,
	small_shift: 22.5,
	x_small_shift: 1,
	xx_small_shift: 0.25,
};
export { modifiers, moveModifierIncrement, rotateModifierIncrement };

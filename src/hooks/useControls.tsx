import { useKeyPress } from 'react-use';
import * as keys from '../constants/KeyModifiers';
import { round, roundClosest } from '../util';

/**
 * Custom hook that provides key modifier states and utility functions for calculating multipliers and rounding values.
 *
 * @returns {Object} An object containing:
 * - `keyModifiers`: An object representing the state of various key modifiers.
 * - `getMultiplier`: A function that returns a multiplier based on the active key modifiers.
 * - `getRounded`: A function that rounds a given value based on the active key modifiers.
 */
const useModifiers = () => {
	const keyModifiers = {
		mega_shift: '',
		normal_shift: '',
		small_shift: useKeyPress(keys.modifiers.small_shift),
		x_small_shift: useKeyPress(keys.modifiers.x_small_shift),

		xx_small_shift: [
			useKeyPress(keys.modifiers.xx_small_shift_1),
			useKeyPress(keys.modifiers.xx_small_shift_2),
		],
	};

	const getMultiplier = () => {
		var multiplier = 1;
		if (keyModifiers.normal_shift) {
			multiplier = keys.moveModifierIncrement.normal_shift;
		} else if (keyModifiers.x_small_shift[0]) {
			multiplier = keys.moveModifierIncrement.x_small_shift;
		} else if (keyModifiers.small_shift[0]) {
			multiplier = keys.moveModifierIncrement.small_shift;
		} else {
			multiplier = 1;
		}
		return multiplier;
	};

	// takes a value and returns a rounded value based on the active key modifiers
	const getRounded = (value: number) => {
		if (keyModifiers.x_small_shift[0]) {
			value = round(value, keys.moveModifierIncrement.x_small_shift, 0);
		} else if (keyModifiers.small_shift[0]) {
			value = round(value, keys.moveModifierIncrement.small_shift, 0);
		} else {
			value = round(value, 1, 0);
		}
		return value;
	};

	return { keyModifiers, getMultiplier, getRounded };
};

export { useModifiers };

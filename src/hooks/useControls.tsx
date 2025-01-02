import { useKeyPress } from "react-use";
import * as keys from "../constants/KeyModifiers";

const useModifiers = () => {
	const modifiers = {
		mega_shift: "",
		normal_shift: "",
		small_shift: useKeyPress(keys.modifiers.small_shift),
		x_small_shift: useKeyPress(keys.modifiers.x_small_shift),

		xx_small_shift: [
			useKeyPress(keys.modifiers.xx_small_shift_1),
			useKeyPress(keys.modifiers.xx_small_shift_2),
		],
	};

	return modifiers;
};

export { useModifiers };

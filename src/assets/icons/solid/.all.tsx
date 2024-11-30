import cube from "./cube";
import arrows_up_down_left_right from "./arrows-up-down-left-right";
import arrows_rotate from "./arrows-rotate";
import arrows_up_right from "./arrows-up-right";
import arrows_to_dot from "./arrows-to-dot";
import caret_down from "./caret-down.jsx";
import caret_left from "./caret-left";
import caret_right from "./caret-right";
import caret_up from "./caret-up";
// prettier-ignore
const icons: { [key: string]: string } = {
	"cube": cube,
	"arrows-up-down-left-right": arrows_up_down_left_right,
	"arrows-rotate": arrows_rotate,
	"arrow-up-right": arrows_up_right,
	"arrows-to-dot": arrows_to_dot,
	"caret-down": caret_down,
	"caret-left": caret_left,
	"caret-right": caret_right,
	"caret-up": caret_up,
};

type IconProps = {
	name: string;
	width?: number;
	height?: number;
	colour?: string;
	alt_text?: string;
	center_x?: boolean;
	center_y?: boolean;
};

const Icon = ({
	name,
	width,
	height,
	colour,
	alt_text,
	center_x,
	center_y,
}: IconProps) => {
	var icon = icons[name];

	if (!icon) {
		console.log(`Icon not found: ${name}`);
		return null;
	}
	if (!width) width = 24;
	if (!height) height = 24;
	if (!colour) colour = "black";
	return (
		<svg
			width={width}
			height={height}
			fill={colour}
			viewBox="0 0 500 500"
			role="img"
			xmlns="http://www.w3.org/2000/svg">
			<title>{alt_text}</title>
			{center_x ? (
				<g transform={"translate(125,0)"}>
					<path d={icon} />
				</g>
			) : (
				<path d={icon} />
			)}
		</svg>
	);
};

export default Icon;

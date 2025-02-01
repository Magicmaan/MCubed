import cube from './cube';
import arrows_up_down_left_right from './arrows-up-down-left-right';
import arrows_rotate from './arrows-rotate';
import arrows_up_right from './arrows-up-right';
import arrows_to_dot from './arrows-to-dot';
import arrows_to_circle from './arrows-to-circle';
import caret_down from './caret-down.jsx';
import caret_left from './caret-left';
import caret_right from './caret-right';
import caret_up from './caret-up';
import question from './question';
import xmark from './xmark';
import check from './check';
import lock from './lock';
import lock_open from './lock-open';
import border_all from './border-all';
import border_none from './border-none';
import arrows_down_to_line from './arrows-down-to-line';
import copy from './copy';
import paste from './paste';
import mirror from './mirror';
import ellipsis from './ellipsis';
import ellipsis_vertical from './ellipsis-vertical';
import exclamation from './exclamation';
import clock from './clock';
import clapperboard from './clapperboard';
// prettier-ignore
const icons: { [key: string]: string | {d:string,viewBox:string} } = {
	"cube": cube,
	"arrows-up-down-left-right": arrows_up_down_left_right,
	"arrows-rotate": arrows_rotate,
	"arrow-up-right": arrows_up_right,
	"arrows-to-dot": arrows_to_dot,
	"arrows-to-circle": arrows_to_circle,
	"arrows-down-to-line": arrows_down_to_line,
	"caret-down": caret_down,
	"caret-left": caret_left,
	"caret-right": caret_right,
	"caret-up": caret_up,
	"question": question,
	"xmark": xmark,
	"check": check,
	"lock": lock,
	"lock-open": lock_open,
	"border-all": border_all,
	"border-none": border_none,
	"copy": copy,
	"paste": paste,
	"mirror": mirror,
	"ellipsis": ellipsis,
	"ellipsis-vertical": ellipsis_vertical,
	"exclamation": exclamation,
	"clock": clock,
	"clapperboard": clapperboard,
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
	var viewBox = '0 0 500 500';

	if (!icon) {
		icon = icons['question'];
	}
	if (typeof icon !== 'string') {
		viewBox = icon.viewBox;
		icon = icon.d;
	}
	if (!width) width = 24;
	if (!height) height = 24;
	if (!colour) colour = 'black';

	const viewBoxParts = viewBox.split(' ');
	return (
		<svg
			width={width}
			height={height}
			fill={colour}
			viewBox={viewBox}
			role="img"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>{alt_text}</title>
			{center_x ? (
				<g
					transform={
						'translate(' +
						(parseFloat(viewBoxParts[2]) / 4).toFixed(0) +
						',0)'
					}
				>
					<path d={icon} />
				</g>
			) : (
				<path d={icon} />
			)}
		</svg>
	);
};

export default Icon;

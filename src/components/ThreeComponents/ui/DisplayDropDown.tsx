import { useAppDispatch, useViewportSelector } from '../../../hooks/useRedux';
import { setRenderMode } from '../../../redux/reducers/viewportReducer';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../../ui/select';
// import { Select } from '@react-three/drei';
import React from 'react';

const solidSVG = (
	<svg width={18} height={18}>
		<rect
			x="0"
			y="0"
			width="100%"
			height="100%"
			rx="35%"
			ry="35%"
			fill="#cacaca"
		/>
	</svg>
);
const wireframeSVG = (
	<svg width={18} height={18}>
		<rect
			x="1"
			y="1"
			width="16"
			height="16"
			rx="35%"
			ry="35%"
			fill="none"
			stroke="#cacaca"
			strokeWidth="2"
			strokeDasharray="4"
		/>
		<line x1="2" y1="2" x2="16" y2="16" stroke="#cacaca" strokeWidth="2" />
	</svg>
);
const textureSVG = (
	<svg width={18} height={18}>
		<defs>
			<clipPath id="cut-off">
				<polygon points="0,0.0 18,0 0,18" />
			</clipPath>
		</defs>
		<rect
			x="0"
			y="0"
			width="100%"
			height="100%"
			rx="35%"
			ry="35%"
			fill="#cacaca"
		/>
		<rect
			x="0"
			y="0"
			width="100%"
			height="100%"
			rx="35%"
			ry="35%"
			fill="#0b9df1"
			clipPath="url(#cut-off)"
		/>
	</svg>
);

interface DisplayDropDownProps {
	dispatch: unknown;
}

const DisplayDropDown: React.FC<DisplayDropDownProps> = ({ dispatch }) => {
	return (
		<Select
			onValueChange={(value) => {
				console.log('value', value);
				dispatch(
					setRenderMode(
						value as 'wireframe' | 'solid' | 'texture' | 'render'
					)
				);
			}}
		>
			<SelectTrigger className="m-0 w-auto p-1">
				<SelectValue
					placeholder={
						<svg width={18} height={18}>
							<rect
								x="0"
								y="0"
								width="100%"
								height="100%"
								rx="35%"
								ry="35%"
								fill="#cacaca"
							/>
						</svg>
					}
					className="m-0 p-0"
				/>
			</SelectTrigger>
			<SelectContent className="dark m-0 p-0">
				<SelectItem value="wireFrame">
					<div className="flex flex-row items-center justify-center gap-2">
						{wireframeSVG}
						Wireframe
					</div>
				</SelectItem>
				<SelectItem value="solid">
					<div className="flex flex-row items-center justify-center gap-2">
						{solidSVG}
						Solid
					</div>
				</SelectItem>
				<SelectItem value="texture">
					<div className="flex flex-row items-center justify-center gap-2">
						{textureSVG}
						Texture
					</div>
				</SelectItem>
			</SelectContent>
		</Select>
	);
};

export default DisplayDropDown;

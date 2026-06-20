import type { HTMLAttributes } from 'react';

type ResizeableBarProps = {
	id?: string;
	width?: number;
	resizable: [boolean, boolean, boolean, boolean];
	className?: string;
} & HTMLAttributes<HTMLDivElement>;

function ResizeableBar({
	children,
	id,
	width,
	className,
	...props
}: ResizeableBarProps) {
	return (
		<aside
			id={id}
			{...props}
			style={{
				...props.style,
				width: width === undefined ? undefined : `${width}px`,
				resize: 'horizontal',
			}}
			className={`transition-border flex h-auto min-w-10 flex-shrink-0 select-text flex-col items-stretch justify-center space-y-2 p-5 duration-100 ${className}`}
		>
			<div className="overflow-show h-full w-full items-start justify-center space-y-2 rounded-xl">
				{children}
			</div>
		</aside>
	);
}

export default ResizeableBar;

import SideBarWidget from './templates/SideBarWidget';

function TextureCanvasView() {
	return (
		<SideBarWidget name="Texture">
			<div
				className="pointer-events-auto flex h-auto w-auto cursor-default select-none flex-col flex-nowrap gap-1 rounded-lg bg-red-200 p-1"
				style={{ imageRendering: 'pixelated' }}
			>
				<div className="grid aspect-square h-auto w-auto grid-cols-8 overflow-hidden bg-blue-500 p-1">
					{Array.from({ length: 64 }).map((_, index) => (
						<div
							key={index}
							className={
								index % 2 === Math.floor(index / 8) % 2
									? 'aspect-square bg-white'
									: 'aspect-square bg-gray-300'
							}
						/>
					))}
				</div>

				<input
					className="pointer-events-auto"
					type="file"
					accept="image/png"
				/>
			</div>
		</SideBarWidget>
	);
}

export default TextureCanvasView;

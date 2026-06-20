
import ResizeableBar from '../components/ResizeableBar';
import TextureCanvasView from '../components/TextureCanvasView';

const styles = {
	pageBackground: `bg-matisse-950 p-1 `,
	panelContainer: `bg-matisse-900 justify-stretch `,
	panelOutline: ``,
	viewportOutline: `border-border border-4 rounded-md `,
};

function TextureView() {
	return (
		<div
			className={
				`flex h-screen w-screen flex-grow-0 flex-col overflow-hidden ` +
				styles.pageBackground
			}
		>
			<div className="pointer-events-none flex h-full w-full max-w-full flex-grow flex-row flex-nowrap items-center justify-stretch gap-1 overflow-hidden overflow-y-hidden">
				<ResizeableBar
					id="leftSidebar"
					resizable={[false, false, true, false]}
					className={
						`max-h-auto flex h-full w-1/6 min-w-72 flex-grow flex-col items-stretch justify-stretch space-y-2 rounded-t-lg ` +
						styles.panelContainer +
						styles.panelOutline
					}
				/>

				<div
					id="viewportContainer"
					className={
						`mb-1 flex h-full w-full flex-grow items-stretch justify-stretch overflow-clip ` +
						styles.viewportOutline
					}
				>
					<div className="flex h-full w-full">
						<TextureCanvasView />
					</div>
				</div>

				<ResizeableBar
					id="rightSidebar"
					resizable={[true, false, false, false]}
					className={
						`flex-shrink-1 flex h-full w-1/6 min-w-4 flex-col items-stretch justify-stretch space-y-2 rounded-t-lg ` +
						styles.panelContainer +
						styles.panelOutline
					}
				/>
			</div>

			<div
				id="bottomBar"
				className={
					`h-12 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-b-lg ` +
					styles.panelContainer +
					styles.panelOutline
				}
			>
				<h2 className="text-white">Bottom Bar</h2>
			</div>
		</div>
	);
}

export default TextureView;

import { useState } from 'react';
import { lazy } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import '../styles/App.css';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Hud, PerspectiveCamera } from '@react-three/drei';

import { CubeProps } from '../components/ThreeComponents/Cube.tsx';

import ModelPartView from '../components/ModelPartView';
import { randomCubeColour } from '../constants/CubeColours.tsx';
import ContextMenu from '../components/ContextMenu.tsx';
import useContextMenu from '../hooks/useContextMenu.tsx';
import CubePartView from '../components/CubePartView';
import { is } from '@react-three/fiber/dist/declarations/src/core/utils';
import { useAppSelector } from '../hooks/useRedux.tsx';
import ResizeableBar from '../components/ResizeableBar.tsx';
import SideBarWidget from '../components/templates/SideBarWidget.tsx';
import TextureCanvasView from '../components/TextureCanvasView.tsx';

const Viewport = lazy(
	() => import('../components/ThreeComponents/Viewport.tsx')
);
function ModelView() {
	// https://github.com/pmndrs/drei/blob/master/src/web/Select.tsx
	// look at this to improve
	const {
		menuVisible,
		menuItems,
		menuPosition,
		showMenu,
		hideMenu,
		handleContextMenu,
	} = useContextMenu();

	//REDUX STUFF
	const mesh = useAppSelector((state) => state.mesh);
	console.log('App mesh data ', mesh);

	return (
		<div className="flex h-full w-screen flex-grow-0 flex-col overflow-hidden">
			<div className="pointer-events-none flex h-full w-screen flex-grow flex-row flex-nowrap items-center justify-stretch gap-1 overflow-hidden overflow-y-hidden p-1">
				<ResizeableBar
					id="leftSidebar"
					width={300}
					resizable={[false, false, true, false]}
					className="flex h-full min-w-10 flex-shrink-0 flex-col items-stretch justify-stretch space-y-2 rounded-xl bg-secondary"
				>
					<ModelPartView />
					<CubePartView />
				</ResizeableBar>

				<div
					id="viewportContainer"
					className="flex h-auto w-auto flex-grow items-stretch justify-stretch self-stretch overflow-clip rounded-md border-4 border-secondary"
				>
					<React.Suspense fallback={<div>Loading...</div>}>
						<div className="h-full w-full">
							<Viewport />
							<div className="viewportBackground pointer-events-none relative bottom-full -z-10 h-full w-full select-none"></div>
						</div>
					</React.Suspense>
				</div>

				<ResizeableBar
					id="rightSidebar"
					width={300}
					resizable={[true, false, false, false]}
					className="flex h-full min-w-10 flex-shrink-0 flex-col items-stretch justify-stretch space-y-2 rounded-xl bg-secondary"
				>
					<TextureCanvasView />
				</ResizeableBar>
			</div>

			<div
				id="bottomBar"
				onContextMenu={handleContextMenu}
				className="h-12 w-full flex-shrink-0 items-center justify-center overflow-hidden bg-slate-800"
			>
				<h2 className="text-white">Bottom Bar</h2>
			</div>
		</div>
	);
}

export default ModelView;

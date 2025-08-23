import { useEffect, useState } from 'react'

import '@styles/app.scss'
import AppLayout from '@components/ui/AppLayout'
import LayoutSection from './components/ui/LayoutSection'
import ManagedScene from './components/three/ManagedScene'
import { useActionStore, useStore } from './hooks/useStore'
import Cube from './objects/Cube'
import { Vector3 } from 'three'
import { useShallow } from 'zustand/shallow'
import ModelTree from './components/ui/ModelTree'
import ModelTreeToolbar from './components/ui/ModelTreeToolbar'

function App() {
	const [count, setCount] = useState(0)

	return (
		<AppLayout>
			<LayoutSection region="top" className="header">
				<p>top</p>
			</LayoutSection>
			<LayoutSection region="left">
				<p>left</p>
				{/* <Test /> */}
				<ModelTreeToolbar />
				<ModelTree />
			</LayoutSection>
			<LayoutSection region="main">
				{/* <Viewport> */}
				<ManagedScene>{/* <Test /> */}</ManagedScene>
				{/* </Viewport> */}
			</LayoutSection>
			<LayoutSection region="right">
				<p>right</p>
			</LayoutSection>
			<LayoutSection region="bottom">
				<p>bottom</p>
			</LayoutSection>
		</AppLayout>
	)
}

export default App

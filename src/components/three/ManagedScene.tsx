import { useActionStore, useModelStore, useSceneStore } from '@/hooks/useStore'
import Cube from '@/objects/Cube'
import { CameraControls, Outlines, PerspectiveCamera } from '@react-three/drei'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import * as THREE from 'three'
import Camera from './Camera'

type ManagedSceneProps = { children?: React.ReactNode }

// a component to manage the Three.js scene and integrate with Zustand store

// synopsis of the structure of the component:
// - the scene is owned by the store
// - the component is used to mount the scene to R3F
// - the useThree hook ideally won't be used to access the scene, instead the scene is accessed via the store

// - allows to create Cube objects and directly control them
// i.e.
// new Cube()
// action.addCube(cube)
// cube.doSomething()
// - this means don't have to sync the state, just manipulate the objects directly

const ManagedScene: React.FC<ManagedSceneProps> = ({ children }) => {
	const managedScene = useSceneStore()
	const model = useModelStore()
	const scene = useMemo(() => new THREE.Scene(), [])

	useEffect(() => {
		// Set the scene in the store only once
		managedScene.setScene(scene)

		model.elements.forEach(element => {
			console.log('Adding element to scene:', element)
		})
	}, [scene])

	return (
		<Canvas scene={scene} className="viewport">
			{children}
			<Camera />
			<ambientLight intensity={0.5} />
			<directionalLight position={[2.5, 5, 5]} intensity={1} />
			<directionalLight position={[-5, -5, -5]} intensity={1} />
			{model.elements.map((element, index) => (
				<>
					{/* <mesh
						onClick={e => {
							console.log('Clicked on element', element.id)
							// e.object.children[0].visible = !e.object.children[0].visible
							e.stopPropagation()
						}}
						// userData={element.userData}
						key={index}
						{...element}
					>
						<Outlines
							thickness={5}
							color="white"
							name={'outline'}
							// visible={element.selected}
							onUpdate={self => {
								console.log('Outline onUpdate called')
							}}
						/>
					</mesh> */}
					<Box element={element} />
				</>
			))}
		</Canvas>
	)
}

const Box = ({ element }: { element: Cube }) => {
	// useFrame(() => {
	// 	console.log('mode select', element.selected)
	// 	element.children[0].visible = element.selected
	// })

	return (
		<>
			<cube
				object={element}
				onClick={element.onClick}
				onUpdate={(self: any) => {
					console.log('cube onUpdate called')
				}}
			>
				<Outlines
					thickness={5}
					color="white"
					name={'outline'}
					visible={element.selected || false}
					onClick={e => {
						console.log('Clicked on outline', element.id)
						e.stopPropagation()
					}}
					onPointerMissed={e => {
						console.log('missed outline')
					}}
					raycast={() => null}
				/>
			</cube>
		</>
	)
}

export default ManagedScene

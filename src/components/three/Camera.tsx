import { useActionStore, useModelStore, useSceneStore, useStore } from '@/hooks/useStore'
import { CameraControls, CycleRaycast, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type React from 'react'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OutlinePass } from 'three/examples/jsm/Addons.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

const Camera: React.FC = () => {
	const three = useThree()
	const managedScene = useSceneStore().getScene()
	const actions = useStore(state => state.getCube)

	const composer = useRef<EffectComposer>(null)
	const renderPass = useRef<RenderPass>(null)
	const outlinePass = useRef<OutlinePass>(null)
	const camera = useRef<THREE.PerspectiveCamera>(null)
	// useEffect(() => {
	// 	if (!managedScene) {
	// 		console.warn('Scene is not available in Camera component, cannot access it.')
	// 		return
	// 	}
	// 	if (!camera.current) {
	// 		console.warn('Camera ref is not set yet.')
	// 		return
	// 	}
	// 	// Perform any necessary setup or updates with the scene
	// 	console.log('Camera component has access to the scene:', managedScene)

	// 	composer.current = new EffectComposer(three.gl)
	// 	composer.current.setSize(window.innerWidth, window.innerHeight)
	// 	composer.current.renderer = three.gl

	// 	renderPass.current = new RenderPass(managedScene, camera.current)

	// 	composer.current.addPass(renderPass.current)

	// 	outlinePass.current = new OutlinePass(
	// 		new THREE.Vector2(window.innerWidth, window.innerHeight),
	// 		managedScene,
	// 		three.camera as THREE.Camera
	// 	)
	// 	outlinePass.current.edgeStrength = 10

	// 	composer.current.addPass(outlinePass.current)
	// }, [managedScene])

	return (
		<group>
			<PerspectiveCamera makeDefault position={[0, 0, 5]} />
			<CameraControls />
			<CycleRaycast
				preventDefault={true} // Call event.preventDefault() (default: true)
				scroll={true} // Wheel events (default: true)
				keyCode={9} // Keyboard events (default: 9 [Tab])
				onChanged={(objects, cycle) => {
					console.log('raycast boi', objects)
					const obj = objects[0]?.object
					if (obj) {
						// TODO: fix this
						// for some reason clicking object again on same point doesn't register
						// so can't deselect by clicking again
						const cube = actions(obj.userData.id)
						if (cube) {
							console.log('Found cube for object key', obj.userData.id, cube)
							cube.setSelected(!cube.selected)
							console.log(
								'Toggled selection for cube',
								cube.userData.id,
								'to',
								cube.selected
							)
						} else {
							console.log('No cube found for object key', obj.userData.id)
						}
					}
					// outlinePass.current!.selectedObjects = [actions(objects[0].object.id)!]
				}} // Optional onChanged event
			/>
		</group>
	)
}
export default Camera

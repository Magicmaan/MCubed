import * as Three from 'three'
import type { StateCreator } from 'zustand'

interface SceneSlice {
	scene: {
		scene: Three.Scene
		setScene: (scene: Three.Scene) => void
		getScene: () => Three.Scene
	}
}

const createSceneSlice: StateCreator<SceneSlice, [], [], SceneSlice> = (set, get) => ({
	scene: {
		scene: new Three.Scene(),
		setScene: (scene: Three.Scene) => {
			set(state => ({
				scene: {
					...state.scene,
					scene,
				},
			}))
			console.log('Scene set:', scene) // Debugging log
		},
		getScene: () => {
			const currentScene = get().scene.scene
			if (!currentScene) {
				throw new Error('Scene is not set')
			}
			return currentScene
		},
	},
})

export default createSceneSlice
export type { SceneSlice }

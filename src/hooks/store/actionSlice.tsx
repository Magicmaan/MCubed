import type Cube from '@/objects/Cube'

interface ActionSlice {
	addCube: (cube: Cube) => Cube
	removeCube: (id: number) => void
	getCube: (id: number) => Cube | undefined
}
import type { StateCreator } from 'zustand'
import type { ModelSlice } from './modelSlice'
import type { SceneSlice } from './sceneSlice'

const createActionSlice: StateCreator<
	ActionSlice & ModelSlice & SceneSlice,
	[],
	[],
	ActionSlice
> = (set, get) => ({
	addCube: cube => {
		set(state => ({
			model: {
				...state.model,
				elements: [...state.model.elements, cube],
			},
		}))
		get().scene.getScene().add(cube)
		console.log('Cube added:', cube) // Debugging log
		return cube
	},
	removeCube: id => {
		const cube = get().getCube(id)
		if (!cube) return

		set(state => ({
			model: {
				...state.model,
				elements: state.model.elements.filter(c => c.id !== id),
			},
		}))
		get().scene.getScene().remove(cube)
	},
	getCube: id => {
		const state = get()
		return state.model.elements.find(cube => cube.id === id)
	},
})

export default createActionSlice
export type { ActionSlice }

// import type Cube from '@/objects/Cube'
import Cube from '@/objects/Cube'
import type { StateCreator } from 'zustand'

interface ModelSlice {
	model: {
		elements: Cube[]
	}
}

const createModelSlice: StateCreator<ModelSlice, [], [], ModelSlice> = (set, get) => ({
	model: {
		elements: [],
		groups: [],
	},
})

export default createModelSlice
export type { ModelSlice }

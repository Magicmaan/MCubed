import { create } from 'zustand'
import type { SessionSlice } from './store/sessionSlice'
import type { ActionSlice } from './store/actionSlice'
import type { SceneSlice } from './store/sceneSlice'
import type { ModelSlice } from './store/modelSlice'
import createModelSlice from './store/modelSlice'
import createSceneSlice from './store/sceneSlice'
import createActionSlice from './store/actionSlice'
import createSessionSlice from './store/sessionSlice'
import type { Scene } from 'node_modules/@types/three/build/three.d.cts'

const useStore = create<SessionSlice & ActionSlice & SceneSlice & ModelSlice>((...a) => ({
	...createSessionSlice(...a),
	...createActionSlice(...a),
	...createSceneSlice(...a),
	...createModelSlice(...a),
}))

const useSessionStore = () => useStore(state => state.session)
const useActionStore = () =>
	useStore(state => ({
		addCube: state.addCube,
		removeCube: state.removeCube,
		getCube: state.getCube,
	}))
const useSceneStore = () => useStore(state => state.scene)
const useModelStore = () => useStore(state => state.model)

export { useStore, useSessionStore, useActionStore, useSceneStore, useModelStore }

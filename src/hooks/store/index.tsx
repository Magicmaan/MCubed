import { create, StateCreator } from 'zustand';
import createMeshSlice, { MeshSlice } from './meshSlice';
import { persist, PersistOptions } from 'zustand/middleware';

type StoreSlices = MeshSlice;

type storePersist = (
	config: StateCreator<StoreSlices>,
	options: PersistOptions<StoreSlices>
) => StateCreator<StoreSlices>;

const useStore = create<StoreSlices>()(
	(persist as storePersist)(
		(...a) => ({
			...createMeshSlice(...a),
			// Add any additional slices or middleware here if needed
		}),
		{ name: 'mesh-store' }
	)
);

export default useStore;

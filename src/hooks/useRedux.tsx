import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../redux/store.ts';

const meshStore = (state: RootState) => state.mesh;
const viewportStore = (state: RootState) => state.viewport;
const appStore = (state: RootState) => state.app;

// Used throughout app instead of plain `useDispatch` and `useSelector` for correct types
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

//mesh store
export const useMeshStoreSelector = () => useAppSelector(meshStore);
export const useMeshDataSelector = () => useAppSelector(meshStore).mesh;
export const useMeshTextureSelector = () => useAppSelector(meshStore).texture;

//viewport store
export const useViewportSelector = () => useAppSelector(viewportStore);
export const useViewportCameraSettingsSelector = () =>
	useAppSelector(viewportStore).cameraSettings;
export const useViewportCameraSelector = () =>
	useAppSelector(viewportStore).cameraControls;
export const useViewportCameraLockSelector = () =>
	useAppSelector(viewportStore).cameraLock;
export const useViewportSelectedSelector = () =>
	useAppSelector(viewportStore).selected;

export const useAppStoreSelector = () => useAppSelector(appStore);
export const useAppActionsSelector = () => useAppSelector(appStore).actions;
export const useAppErrorsSelector = () => useAppSelector(appStore).errors;

//undo redo stuff

import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store.ts";

const meshStore = (state: RootState) => state.mesh;
const viewportStore = (state: RootState) => state.viewport;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useMeshStoreSelector = () => useAppSelector(meshStore);
export const useMeshDataSelector = () => useAppSelector(meshStore).mesh;
export const useMeshTextureSelector = () => useAppSelector(meshStore).texture;

export const useViewportSelector = () => useAppSelector(viewportStore);
export const useViewportCameraSettingsSelector = () =>
	useAppSelector(viewportStore).cameraSettings;
export const useViewportCameraSelector = () =>
	useAppSelector(viewportStore).cameraControls;
export const useViewportSelectedSelector = () => useAppSelector(viewportStore).selected;

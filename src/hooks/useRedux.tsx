import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "../store.ts";

const selectMesh = (state: RootState) => state.mesh;
const selectViewport = (state: RootState) => state.viewport;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useMeshSelector = () => useAppSelector(selectMesh);
export const useMeshArraySelector = () => useAppSelector(selectMesh).meshArray;
export const useViewportSelector = () => useAppSelector(selectViewport);

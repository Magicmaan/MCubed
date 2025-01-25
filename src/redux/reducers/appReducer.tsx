import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MeshState } from '../meshReducer';

type Action = {
	type: string;
	action: string;
	time: string;
};

type Error = {
	type: string;
	error: string;
	info: any;
	advice: string;
};

type appState = {
	actions: Action[];
	errors: Error[];

	model?: MeshState;
	saved: boolean;
	fromFile: boolean;
	filePath?: string;
};

const appInitialState: appState = {
	actions: [],
	errors: [],

	model: undefined,
	saved: false,
	fromFile: false,
};

const appSlice = createSlice({
	name: 'app',
	initialState: appInitialState,
	reducers: {
		addAction(state, action: PayloadAction<Action>) {
			state.actions.push(action.payload);
		},
		addError(state, action: PayloadAction<Error>) {
			console.log('Error added');
			state.errors.push(action.payload);
		},
	},
});

export default appSlice;
export const { addAction, addError } = appSlice.actions;
export type { Action, Error, appState };

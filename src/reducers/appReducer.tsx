import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
};

const appInitialState: appState = {
	actions: [],
	errors: [],
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

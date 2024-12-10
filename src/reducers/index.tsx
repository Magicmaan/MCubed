import { combineReducers } from "@reduxjs/toolkit";
// Import your individual reducers here
import meshSlice from "./meshReducer.tsx"; // Example reducer
import viewportSlice from "./viewportReducer.tsx";

const rootReducer = combineReducers({
	mesh: meshSlice.reducer,
	viewport: viewportSlice.reducer,
	// Add other reducers here
});

export default rootReducer;

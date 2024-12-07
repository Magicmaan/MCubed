import { combineReducers } from "@reduxjs/toolkit";
// Import your individual reducers here
import meshSlice from "./someReducer.tsx"; // Example reducer

const rootReducer = combineReducers({
	mesh: meshSlice.reducer,
	// Add other reducers here
});

export default rootReducer;

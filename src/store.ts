import { configureStore } from "@reduxjs/toolkit";
// Import your reducers here
import rootReducer from "./reducers"; // Assuming you have a rootReducer

const store = configureStore({
	reducer: rootReducer,
});

export default store;
// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

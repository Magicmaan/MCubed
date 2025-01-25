import { configureStore } from '@reduxjs/toolkit';
// Import your reducers here
import rootReducer from './reducers'; // Assuming you have a rootReducer

const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Ignore these action types
				ignoredActions: ['viewport/setScene'],
				// Ignore these field paths in all actions
				ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
				// Ignore these paths in the state
				ignoredPaths: ['items.dates'],
			},
		}),
});

export default store;
// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

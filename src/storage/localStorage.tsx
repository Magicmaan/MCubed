const getLocalStorage = (key: string) => {
	return localStorage.getItem(key);
};
const getLocalStorageKeys = () => {
	return Object.keys(localStorage);
};
const clearLocalStorage = () => {
	localStorage.clear();
};
const setLocalStorage = (key: string, value: string) => {
	localStorage.setItem(key, value);
};



export {
	getLocalStorage,
	getLocalStorageKeys,
	clearLocalStorage,
	setLocalStorage,
};

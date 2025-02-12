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

const getSessionStorage = (key: string) => {
	return sessionStorage.getItem(key);
};

const getSessionStorageKeys = () => {
	return Object.keys(sessionStorage);
};

const clearSessionStorage = () => {
	sessionStorage.clear();
};

const setSessionStorage = (key: string, value: string) => {
	sessionStorage.setItem(key, value);
};

export {
	getLocalStorage,
	getLocalStorageKeys,
	clearLocalStorage,
	setLocalStorage,
	getSessionStorage,
	getSessionStorageKeys,
	clearSessionStorage,
	setSessionStorage,
	setSessionStorage as setCacheStorage,
};

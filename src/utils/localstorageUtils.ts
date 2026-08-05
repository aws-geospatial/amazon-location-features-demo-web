export const clearStorage = () => {
	const localStorageKeys = Object.keys(localStorage);

	localStorageKeys.forEach(localStorageKey => {
		localStorage.removeItem(localStorageKey);
	});
};

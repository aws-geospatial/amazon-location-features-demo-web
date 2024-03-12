import { appConfig } from "@demo/core/constants";

const {
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, ANALYTICS_ENDPOINT_ID, ANALYTICS_CREDS }
} = appConfig;

const endpointIdKey = `${LOCAL_STORAGE_PREFIX}${ANALYTICS_ENDPOINT_ID}`;
const analyticsCredsKey = `${LOCAL_STORAGE_PREFIX}${ANALYTICS_CREDS}`;

const keysToExclude = [endpointIdKey, analyticsCredsKey];

export const clearStorage = () => {
	const localStorageKeys = Object.keys(localStorage);

	localStorageKeys.forEach(localStorageKey => {
		if (!keysToExclude.includes(localStorageKey)) {
			localStorage.removeItem(localStorageKey);
		}
	});
};

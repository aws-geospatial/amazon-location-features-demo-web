import { useCallback, useEffect } from "react";

import { appConfig } from "@demo/core/constants";
import { differenceInMilliseconds } from "date-fns";

import useAuth from "./useAuth";
import useClient from "./useClient";
import useIot from "./useIot";

const {
	API_KEYS,
	PERSIST_STORAGE_KEYS: { SHOULD_CLEAR_CREDENTIALS }
} = appConfig;
let timeout: NodeJS.Timeout | undefined;

const useAuthManager = () => {
	const { credentials, fetchCredentials, clearCredentials, baseValues, apiKey, fetchLocationClientConfigWithApiKey } =
		useAuth();
	const {
		placesClient,
		createPlacesClient,
		routesClient,
		createRoutesClient,
		locationClient,
		createLocationClient,
		iotClient,
		createIotClient,
		resetLocationAndIotClients
	} = useClient();
	const { attachPolicy } = useIot();
	const shouldClearCredentials = localStorage.getItem(SHOULD_CLEAR_CREDENTIALS) === "true";

	/* Instantiate Places and Routes clients whenever the apiKey changes */
	useEffect(() => {
		if (!!apiKey && baseValues) {
			(async () => {
				const apiKeyRegion = baseValues.region in API_KEYS ? baseValues.region : Object.keys(API_KEYS)[0];
				const locationClientConfig = await fetchLocationClientConfigWithApiKey(apiKey, apiKeyRegion);

				if (locationClientConfig) {
					!placesClient && createPlacesClient(locationClientConfig);
					!routesClient && createRoutesClient(locationClientConfig);
				}
			})();
		}
	}, [
		apiKey,
		baseValues,
		fetchLocationClientConfigWithApiKey,
		placesClient,
		createPlacesClient,
		routesClient,
		createRoutesClient
	]);

	const clearCredsAndClients = useCallback(() => {
		clearCredentials();
		resetLocationAndIotClients();
	}, [clearCredentials, resetLocationAndIotClients]);

	if (shouldClearCredentials || (!!credentials && !credentials?.identityId)) {
		localStorage.removeItem(SHOULD_CLEAR_CREDENTIALS);
		clearCredsAndClients();
	}

	const refreshCredentials = useCallback(() => {
		clearCredsAndClients();
	}, [clearCredsAndClients]);

	/* Fetch the current user credentials */
	useEffect(() => {
		if (credentials && credentials.expiration) {
			const now = new Date();
			const expiration = new Date(credentials.expiration);

			if (now > expiration) {
				/* If the credentials are expired, refresh them */
				refreshCredentials();
			} else {
				/* If the credentials are not expired, set the refresh timeout */
				timeout && clearTimeout(timeout);
				timeout = setTimeout(() => {
					refreshCredentials();
				}, differenceInMilliseconds(new Date(credentials.expiration || 0), now) - 5 * 60 * 1000); /* Refresh 5 minutes before expiration */
			}
		} else {
			/* If the credentials are not present, fetch them */
			(async () => {
				await fetchCredentials();
			})();
		}
	}, [credentials, fetchCredentials, clearCredsAndClients, refreshCredentials]);

	/* Instantiate location client for Geofences and Trackers and iot client whenever the credentials change */
	useEffect(() => {
		if (credentials) {
			if (baseValues) {
				const { region } = baseValues;
				!locationClient &&
					createLocationClient({ ...credentials, expiration: new Date(credentials!.expiration!) }, region);
				!iotClient && createIotClient({ ...credentials, expiration: new Date(credentials!.expiration!) }, region);
			}
		}
	}, [credentials, iotClient, locationClient, createIotClient, createLocationClient, baseValues]);

	const _attachPolicy = useCallback(async () => {
		if (credentials && credentials?.expiration) {
			const now = new Date();
			const expiration = new Date(credentials.expiration);

			if (now > expiration) {
				/* If the credentials are expired, refresh them */
				refreshCredentials();
			} else {
				await attachPolicy(credentials.identityId);
			}
		}
	}, [credentials, refreshCredentials, attachPolicy]);

	/* Attach IoT policy to unauth user to ensure successful websocket connection */
	useEffect(() => {
		_attachPolicy();
	}, [_attachPolicy]);

	return { clearCredsAndClients };
};

export default useAuthManager;

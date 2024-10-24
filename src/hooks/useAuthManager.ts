import { useCallback, useEffect } from "react";

import { appConfig } from "@demo/core/constants";

import { EventTypeEnum } from "@demo/types/Enums";
import { record } from "@demo/utils";
import { differenceInMilliseconds } from "date-fns";

import useAuth from "./useAuth";
import useClient from "./useClient";
import useIot from "./useIot";

const {
	API_KEYS,
	PERSIST_STORAGE_KEYS: { SHOULD_CLEAR_CREDENTIALS },
	ROUTES: { DEMO }
} = appConfig;
let timeout: NodeJS.Timer | undefined;

const useAuthManager = () => {
	const {
		credentials,
		fetchCredentials,
		clearCredentials,
		baseValues,
		userProvidedValues,
		fetchTokens,
		refreshTokens,
		authTokens,
		setAuthTokens,
		apiKey,
		fetchLocationClientConfigWithApiKey
	} = useAuth();
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
					!routesClient && createRoutesClient(locationClientConfig, apiKeyRegion);
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
		if (credentials && credentials.authenticated) {
			(async () => {
				await refreshTokens();
			})();
		}

		clearCredsAndClients();
	}, [clearCredsAndClients, credentials, refreshTokens]);

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
	}, [
		credentials,
		fetchCredentials,
		clearCredsAndClients,
		refreshTokens,
		authTokens,
		setAuthTokens,
		refreshCredentials
	]);

	/* Instantiate location client for Geofences and Trackers and iot client whenever the credentials change */
	useEffect(() => {
		if (credentials) {
			if (userProvidedValues) {
				const { region } = userProvidedValues;
				!locationClient &&
					createLocationClient({ ...credentials, expiration: new Date(credentials!.expiration!) }, region);
				!iotClient && createIotClient({ ...credentials, expiration: new Date(credentials!.expiration!) }, region);
			} else if (baseValues) {
				const { region } = baseValues;
				!locationClient &&
					createLocationClient({ ...credentials, expiration: new Date(credentials!.expiration!) }, region);
				!iotClient && createIotClient({ ...credentials, expiration: new Date(credentials!.expiration!) }, region);
			}
		}
	}, [credentials, userProvidedValues, iotClient, locationClient, createIotClient, createLocationClient, baseValues]);

	/* Fired when user logs in or logs out */
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const code = searchParams.get("code");
		const sign_out = searchParams.get("sign_out");

		/* After login */
		if (code) {
			window.history.replaceState(undefined, "", DEMO);
			(async () => {
				await fetchTokens(code);
				clearCredsAndClients();
			})();
		}

		/* After logout */
		if (sign_out === "true") {
			(async () =>
				await record(
					[{ EventType: EventTypeEnum.SIGN_OUT_SUCCESSFUL, Attributes: {} }],
					["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
				))();
			window.history.replaceState(undefined, "", DEMO);
			clearCredsAndClients();
		}
	}, [fetchTokens, clearCredsAndClients]);

	const _attachPolicy = useCallback(async () => {
		if (credentials && credentials?.expiration) {
			const now = new Date();
			const expiration = new Date(credentials.expiration);

			if (now > expiration) {
				/* If the credentials are expired, refresh them */
				refreshCredentials();
			} else {
				if (credentials.authenticated) {
					await attachPolicy(credentials.identityId);
				} else if (!userProvidedValues) {
					await attachPolicy(credentials.identityId, true);
				}
			}
		}
	}, [credentials, refreshCredentials, userProvidedValues, attachPolicy]);

	/* Attach IoT policy to unauth and auth user to ensure successful websocket connection */
	useEffect(() => {
		_attachPolicy();
	}, [_attachPolicy]);

	return { clearCredsAndClients };
};

export default useAuthManager;

import { useCallback, useEffect } from "react";

import { appConfig } from "@demo/core/constants";

import { EventTypeEnum, MapProviderEnum } from "@demo/types/Enums";
import { record } from "@demo/utils";
import { differenceInMilliseconds } from "date-fns";

import useAuth from "./useAuth";
import useClient from "./useClient";
import useIot from "./useIot";
import useMap from "./useMap";

const {
	PERSIST_STORAGE_KEYS: { SHOULD_CLEAR_CREDENTIALS },
	ROUTES: { DEMO }
} = appConfig;
let timeout: NodeJS.Timer | undefined;

const useCredsManager = () => {
	const {
		credentials,
		fetchCredentials,
		clearCredentials,
		region,
		isUserAwsAccountConnected,
		identityPoolId,
		fetchTokens,
		refreshTokens,
		userPoolId,
		userPoolClientId,
		authTokens,
		setAuthTokens,
		authOptions
	} = useAuth();
	const {
		locationClient,
		createLocationClient,
		iotClient,
		createIotClient,
		resetStore: resetClientStore
	} = useClient();
	const { attachPolicy } = useIot();
	const { mapProvider: currentMapProvider } = useMap();
	const shouldClearCredentials = localStorage.getItem(SHOULD_CLEAR_CREDENTIALS) === "true";

	const clearCredsAndClients = useCallback(() => {
		clearCredentials();
		resetClientStore();
	}, [clearCredentials, resetClientStore]);

	if (shouldClearCredentials || (!!credentials && !credentials?.identityId)) {
		localStorage.removeItem(SHOULD_CLEAR_CREDENTIALS);
		clearCredsAndClients();
	}

	const refreshCredentials = useCallback(async () => {
		if (credentials && credentials.authenticated) {
			(async () => {
				await refreshTokens();
			})();
		}

		clearCredsAndClients();
	}, [clearCredsAndClients, credentials, refreshTokens]);

	/* Fetch the current user credentials */
	useEffect(() => {
		if (credentials && credentials.expiration && authOptions?.transformRequest) {
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
				}, differenceInMilliseconds(new Date(credentials.expiration || 0), new Date()) - 5 * 60 * 1000); /* Refresh 5 minutes before expiration */
			}
		} else {
			/* If the credentials are not present, fetch them */
			(async () => {
				await fetchCredentials();
			})();
		}
	}, [
		credentials,
		authOptions,
		fetchCredentials,
		resetClientStore,
		clearCredsAndClients,
		refreshTokens,
		authTokens,
		setAuthTokens,
		refreshCredentials
	]);

	/* Instantiate location and iot clients whenever the credentials change */
	useEffect(() => {
		if (credentials && region) {
			!locationClient && createLocationClient(credentials, region);
			!iotClient && createIotClient(credentials, region);
		}
	}, [createIotClient, createLocationClient, credentials, iotClient, locationClient, region]);

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
	}, [clearCredsAndClients, credentials, identityPoolId, userPoolClientId, region, userPoolId, fetchTokens]);

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
				} else if (!isUserAwsAccountConnected && currentMapProvider !== MapProviderEnum.GRAB) {
					await attachPolicy(credentials.identityId, true);
				}
			}
		}
	}, [credentials, refreshCredentials, isUserAwsAccountConnected, currentMapProvider, attachPolicy]);

	/* Attach IoT policy to authenticated user to ensure successful websocket connection */
	useEffect(() => {
		_attachPolicy();
	}, [_attachPolicy]);

	return { clearCredsAndClients };
};

export default useCredsManager;

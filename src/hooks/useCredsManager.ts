import { useCallback, useEffect } from "react";

import { appConfig } from "@demo/core/constants";

import { EventTypeEnum, MapProviderEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { differenceInMilliseconds } from "date-fns";

import useAmplifyAuth from "./useAmplifyAuth";
import useAmplifyMap from "./useAmplifyMap";
import useAws from "./useAws";
import useAwsIot from "./useAwsIot";

const {
	PERSIST_STORAGE_KEYS: { SHOULD_CLEAR_CREDENTIALS },
	ROUTES: { DEMO }
} = appConfig;
let interval: NodeJS.Timer | undefined;
let timeout: NodeJS.Timer | undefined;

const useCredsManager = () => {
	const {
		credentials,
		getCurrentUserCredentials,
		clearCredentials,
		region,
		authTokens,
		setAuthTokens,
		onLogout,
		handleCurrentSession,
		isUserAwsAccountConnected
	} = useAmplifyAuth();
	const { locationClient, createLocationClient, iotClient, createIotClient, resetStore: resetAwsStore } = useAws();
	const { attachPolicy } = useAwsIot();
	const { mapProvider: currentMapProvider } = useAmplifyMap();
	const shouldClearCredentials = localStorage.getItem(SHOULD_CLEAR_CREDENTIALS) === "true";

	const clearCredsAndLocationClient = useCallback(() => {
		clearCredentials();
		resetAwsStore();
	}, [clearCredentials, resetAwsStore]);

	if (shouldClearCredentials || (!!credentials && !credentials?.identityId)) {
		localStorage.removeItem(SHOULD_CLEAR_CREDENTIALS);
		clearCredsAndLocationClient();
	}

	/* Fetch the current user credentials */
	useEffect(() => {
		if (credentials?.identityId && credentials?.expiration) {
			const now = new Date();
			const expiration = new Date(credentials.expiration);

			if (now > expiration) {
				/* If the credentials are expired, clear them and the location client */
				clearCredsAndLocationClient();
			} else {
				/* If the credentials are not expired, set the refresh interval/timeout */
				interval && clearInterval(interval);
				timeout && clearTimeout(timeout);

				if (credentials.authenticated) {
					/* If the credentials are authenticated, set the refresh interval */
					interval = setInterval(() => {
						handleCurrentSession(resetAwsStore);
					}, 10 * 60 * 1000);
				} else {
					/* If the credentials are not authenticated, set the refresh timeout */
					timeout = setTimeout(() => {
						clearCredsAndLocationClient();
					}, differenceInMilliseconds(new Date(credentials.expiration || 0), new Date()));
				}
			}
		} else {
			/* If the credentials are not present, fetch them */
			getCurrentUserCredentials();
		}
	}, [credentials, getCurrentUserCredentials, handleCurrentSession, resetAwsStore, clearCredsAndLocationClient]);

	/* Instantiate location and iot client from aws-sdk whenever the credentials change */
	useEffect(() => {
		if (credentials && region) {
			!locationClient && createLocationClient(credentials, region);
			!iotClient && createIotClient(credentials, region);
		}
	}, [credentials, locationClient, createLocationClient, region, iotClient, createIotClient]);

	const _onLogout = useCallback(async () => {
		await onLogout();
		clearCredentials();
		resetAwsStore();
	}, [onLogout, clearCredentials, resetAwsStore]);

	/* Fired when user logs in or logs out */
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const code = searchParams.get("code");
		const state = searchParams.get("state");
		const sign_out = searchParams.get("sign_out");

		/* After login */
		if (code && state && !authTokens) {
			window.history.replaceState(undefined, "", DEMO);
			setAuthTokens({ code, state });
			record(
				[{ EventType: EventTypeEnum.SIGN_IN_SUCCESSFUL, Attributes: {} }],
				["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
			);
			setTimeout(() => clearCredsAndLocationClient(), 0);
		}

		/* After logout */
		if (sign_out === "true") {
			window.history.replaceState(undefined, "", DEMO);
			!!credentials?.authenticated && !authTokens && _onLogout();
		}
	}, [setAuthTokens, clearCredsAndLocationClient, credentials, authTokens, _onLogout]);

	const _attachPolicy = useCallback(async () => {
		if (credentials?.identityId && credentials?.expiration) {
			const now = new Date();
			const expiration = new Date(credentials.expiration);

			if (now > expiration) {
				/* If the credentials are expired, clear them and the location client */
				clearCredsAndLocationClient();
			} else {
				if (!!credentials.authenticated && !!authTokens) {
					await attachPolicy(credentials.identityId);
				} else if (!isUserAwsAccountConnected && currentMapProvider !== MapProviderEnum.GRAB) {
					await attachPolicy(credentials.identityId, true);
				}
			}
		}
	}, [
		credentials,
		clearCredsAndLocationClient,
		authTokens,
		attachPolicy,
		isUserAwsAccountConnected,
		currentMapProvider
	]);

	/* Attach IoT policy to authenticated user to ensure successful websocket connection */
	useEffect(() => {
		_attachPolicy();
	}, [_attachPolicy]);

	return { clearCredsAndLocationClient };
};

export default useCredsManager;

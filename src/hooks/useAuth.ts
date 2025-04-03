/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useEffect, useMemo } from "react";

import appConfig from "@demo/core/constants/appConfig";
import { useAuthService } from "@demo/services";
import { useAuthStore } from "@demo/stores";
import { RegionEnum } from "@demo/types/Enums";
import { errorHandler } from "@demo/utils/errorHandler";
import { setClosestRegion } from "@demo/utils/regionUtils";
import { useTranslation } from "react-i18next";

const {
	API_KEYS,
	IDENTITY_POOL_IDS,
	WEB_SOCKET_URLS,
	ROUTES: { DEMO },
	PERSIST_STORAGE_KEYS: { FASTEST_REGION }
} = appConfig;
const fallbackRegion = Object.keys(API_KEYS)[0];

const useAuth = () => {
	const store = useAuthStore();
	const { setInitial } = store;
	const { setState } = useAuthStore;
	const authService = useAuthService();
	const { t } = useTranslation();

	// Set initial apiKey, identityPoolId, region, and webSocketUrl when user lands on Demo app for the first time
	useEffect(() => {
		if (window.location.pathname === DEMO && (!store.apiKey || !store.baseValues)) {
			(async () => {
				await setClosestRegion();
				const region = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
				!!API_KEYS[region] &&
					!!IDENTITY_POOL_IDS[region] &&
					!!WEB_SOCKET_URLS[region] &&
					setState({
						apiKey: API_KEYS[region],
						baseValues: {
							identityPoolId: IDENTITY_POOL_IDS[region],
							region,
							webSocketUrl: WEB_SOCKET_URLS[region]
						}
					});
			})();
		}
	}, [store.apiKey, store.baseValues, setState]);

	const methods = useMemo(
		() => ({
			fetchLocationClientConfigWithApiKey: async (apiKey: string, region: string) => {
				try {
					const authHelper = await authService.withAPIKey(apiKey);
					const locationClientConfig = authHelper.getLocationClientConfig();
					return { ...locationClientConfig, region };
				} catch (error) {
					errorHandler(error);
				}
			},
			fetchCredentials: async () => {
				try {
					const { baseValues } = store;

					if (baseValues) {
						const { identityPoolId, region } = baseValues;
						const cognitoIdentityCredentials = await authService.fetchCredentials(identityPoolId, region, undefined);
						setState({
							credentials: {
								...cognitoIdentityCredentials,
								expiration: new Date(cognitoIdentityCredentials.expiration!),
								authenticated: false
							}
						});
					}
				} catch (error) {
					errorHandler(error, t("error_handler__failed_fetch_creds.text"));
				}
			},
			clearCredentials: () => {
				setState({ credentials: undefined });
			},
			setRegion: (autoRegion: boolean, region: "Automatic" | RegionEnum) => {
				if (autoRegion) {
					(async () => {
						await setClosestRegion();
						const region = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
						!!API_KEYS[region] &&
							!!IDENTITY_POOL_IDS[region] &&
							!!WEB_SOCKET_URLS[region] &&
							setState({
								apiKey: API_KEYS[region],
								baseValues: {
									identityPoolId: IDENTITY_POOL_IDS[region],
									region,
									webSocketUrl: WEB_SOCKET_URLS[region]
								},
								autoRegion,
								credentials: undefined
							});
					})();
				} else {
					!!API_KEYS[region] &&
						!!IDENTITY_POOL_IDS[region] &&
						!!WEB_SOCKET_URLS[region] &&
						setState({
							apiKey: API_KEYS[region],
							baseValues: {
								identityPoolId: IDENTITY_POOL_IDS[region],
								region,
								webSocketUrl: WEB_SOCKET_URLS[region]
							},
							autoRegion,
							credentials: undefined
						});
				}
			},
			resetStore: () => {
				setState({
					credentials: undefined,
					baseValues: undefined,
					apiKey: undefined
				});
				setInitial();
			}
		}),
		[authService, store, setState, t, setInitial]
	);

	return { ...methods, ...store };
};

export default useAuth;

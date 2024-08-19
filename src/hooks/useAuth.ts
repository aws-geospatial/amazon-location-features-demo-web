/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useEffect, useMemo } from "react";

import { CognitoIdentity } from "@aws-sdk/client-cognito-identity";
import { showToast } from "@demo/core/Toast";
import appConfig from "@demo/core/constants/appConfig";
import { useClient, useMap } from "@demo/hooks";
import { useAuthService } from "@demo/services";
import { useAuthStore } from "@demo/stores";
import { AuthTokensType, CognitoIdentityCredentials, ConnectFormValuesType, ToastType } from "@demo/types";
import { EventTypeEnum, RegionEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { errorHandler } from "@demo/utils/errorHandler";
import { getDomainName } from "@demo/utils/getDomainName";
import { clearStorage } from "@demo/utils/localstorageUtils";
import { setClosestRegion } from "@demo/utils/regionUtils";
import { transformCloudFormationLink } from "@demo/utils/transformCloudFormationLink";
import { useTranslation } from "react-i18next";

import useDeviceMediaQuery from "./useDeviceMediaQuery";

const {
	POOLS,
	WEB_SOCKET_URLS,
	ROUTES: { DEMO },
	PERSIST_STORAGE_KEYS: { FASTEST_REGION },
	MAP_RESOURCES: { GRAB_SUPPORTED_AWS_REGIONS }
} = appConfig;
const fallbackRegion = POOLS[Object.keys(POOLS)[0]];

const useAuth = () => {
	const store = useAuthStore();
	const { setInitial } = store;
	const { setState } = useAuthStore;
	const authService = useAuthService();
	const { resetStore: resetClientStore } = useClient();
	const { resetStore: resetMapStore } = useMap();
	const { t } = useTranslation();
	const { isDesktop } = useDeviceMediaQuery();

	useEffect(() => {
		if (window.location.pathname === DEMO && !store.identityPoolId) {
			(async () => {
				await setClosestRegion();
				const region = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
				const identityPoolId = POOLS[region];
				const webSocketUrl = WEB_SOCKET_URLS[region];
				setState({ identityPoolId, region, webSocketUrl });
			})();
		}
	}, [store.identityPoolId, setState]);

	const methods = useMemo(
		() => ({
			fetchCredentials: async () => {
				try {
					const { identityPoolId, region, userPoolId, authTokens } = store;

					if (identityPoolId && region) {
						const authHelper = await authService.withIdentityPoolId(identityPoolId, region, authTokens, userPoolId);
						const credentials = authHelper.getCredentials();
						const authOptions = authHelper.getMapAuthenticationOptions();

						setState({
							credentials: { ...credentials, authenticated: authTokens ? true : false } as CognitoIdentityCredentials,
							authOptions: { ...authOptions }
						});
					}
				} catch (error) {
					errorHandler(error, t("error_handler__failed_fetch_creds.text"));
				}
			},
			fetchTokens: async (code: string) => {
				try {
					const { userDomain, userPoolClientId } = store;

					if (userDomain && userPoolClientId) {
						const response = await authService.fetchTokens(userDomain, userPoolClientId, code);

						if (!response.ok) {
							throw new Error(t("error_handler__failed_fetch_tokens.text"));
						}

						const authTokens = await response.json();
						setState({ authTokens });
						record(
							[{ EventType: EventTypeEnum.SIGN_IN_SUCCESSFUL, Attributes: {} }],
							["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
						);
					}
				} catch (error) {
					record(
						[{ EventType: EventTypeEnum.SIGN_IN_FAILED, Attributes: {} }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
					errorHandler(error, t("error_handler__failed_fetch_tokens.text"));
				}
			},
			refreshTokens: async () => {
				try {
					const { userDomain, userPoolClientId, authTokens } = store;

					if (userDomain && userPoolClientId && authTokens) {
						const response = await authService.refreshTokens(userDomain, userPoolClientId, authTokens.refresh_token);

						if (!response.ok) {
							throw new Error(t("error_handler__failed_refresh_tokens.text"));
						}

						const newTokens = await response.json();
						setState({ authTokens: { ...newTokens, refresh_token: authTokens.refresh_token } });
					}
				} catch (error) {
					errorHandler(error, t("error_handler__failed_refresh_tokens.text"));
				}
			},
			validateIdentityPoolIdAndRegion: (IdentityPoolId: string, successCb?: () => void) => {
				const cognitoidentity = new CognitoIdentity({ region: IdentityPoolId.split(":")[0] });
				cognitoidentity.getId(
					{
						IdentityPoolId
					},
					err => {
						if (err) {
							console.error({ err });
							record(
								[
									{ EventType: EventTypeEnum.AWS_ACCOUNT_CONNECTION_FAILED, Attributes: { error: JSON.stringify(err) } }
								],
								["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
							);
							showToast({
								content: t("show_toast__failed_to_connect_1.text"),
								type: ToastType.ERROR
							});
						} else {
							successCb && successCb();
							record(
								[{ EventType: EventTypeEnum.AWS_ACCOUNT_CONNECTION_SUCCESSFUL, Attributes: {} }],
								["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
							);
						}
					}
				);
			},
			validateFormValues: (identityPoolId: string, successCb?: () => void) => {
				/* Validates identityPoolId and region */
				methods.validateIdentityPoolIdAndRegion(
					identityPoolId,
					/* Success callback */
					() => {
						successCb && successCb();
					}
				);
			},
			clearCredentials: () => {
				setState({ credentials: undefined, authOptions: undefined });
			},
			setAuthTokens: (authTokens?: AuthTokensType) => {
				setState({ authTokens });
			},
			setConnectFormValues: ({
				IdentityPoolId,
				UserDomain,
				UserPoolClientId,
				UserPoolId,
				WebSocketUrl
			}: ConnectFormValuesType) => {
				setState({
					identityPoolId: IdentityPoolId,
					region: IdentityPoolId.split(":")[0],
					userDomain: getDomainName(UserDomain),
					userPoolClientId: UserPoolClientId,
					userPoolId: UserPoolId,
					webSocketUrl: WebSocketUrl
				});
			},
			setIsUserAwsAccountConnected: (isUserAwsAccountConnected: boolean) => {
				setState({ isUserAwsAccountConnected });
			},
			onLogin: () => {
				try {
					const { userDomain, userPoolClientId } = store;

					if (userDomain && userPoolClientId) {
						setState({ authTokens: undefined });
						window.open(
							`https://${userDomain}/login?client_id=${userPoolClientId}&response_type=code&identity_provider=COGNITO&redirect_uri=${window.location.origin}${DEMO}`,
							"_self"
						);
					}
				} catch (error) {
					record(
						[{ EventType: EventTypeEnum.SIGN_IN_FAILED, Attributes: { error: JSON.stringify(error) } }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
					errorHandler(error, t("error_handler__failed_sign_in.text") as string);
				}
			},
			onLogout: () => {
				try {
					const { userDomain, userPoolClientId } = store;

					if (userDomain && userPoolClientId) {
						setState({ authTokens: undefined });
						window.open(
							`https://${userDomain}/logout?client_id=${userPoolClientId}&logout_uri=${window.location.origin}${DEMO}?sign_out=true`,
							"_self"
						);
					}
				} catch (error) {
					record(
						[{ EventType: EventTypeEnum.SIGN_OUT_FAILED, Attributes: { error: JSON.stringify(error) } }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
					errorHandler(error, t("error_handler__failed_sign_out.text") as string);
				}
			},
			onDisconnectAwsAccount: () => {
				clearStorage();
				methods.resetStore();
				resetClientStore();
				resetMapStore();
				setTimeout(() => window.location.reload(), 3000);
			},
			switchToGrabMapRegionStack: () => {
				for (const region of GRAB_SUPPORTED_AWS_REGIONS) {
					const identityPoolId = POOLS[region];
					const webSocketUrl = WEB_SOCKET_URLS[region];

					if (identityPoolId) {
						setState({ identityPoolId, region, webSocketUrl, credentials: undefined, authOptions: undefined });
						return;
					}
				}
			},
			switchToDefaultRegionStack: () => {
				const region = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
				const identityPoolId = POOLS[region];
				const webSocketUrl = WEB_SOCKET_URLS[region];

				setState({ identityPoolId, region, webSocketUrl, credentials: undefined, authOptions: undefined });
			},
			setAutoRegion: (autoRegion: boolean, region: "Automatic" | RegionEnum) => {
				if (autoRegion) {
					(async () => {
						await setClosestRegion();
						const region = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
						const identityPoolId = POOLS[region];
						const webSocketUrl = WEB_SOCKET_URLS[region];
						setState({
							identityPoolId,
							region,
							webSocketUrl,
							autoRegion,
							credentials: undefined,
							authOptions: undefined
						});
					})();
				} else {
					!!POOLS[region] &&
						!!WEB_SOCKET_URLS[region] &&
						setState({
							identityPoolId: POOLS[region],
							region,
							webSocketUrl: WEB_SOCKET_URLS[region],
							autoRegion,
							credentials: undefined,
							authOptions: undefined
						});
				}
			},
			setIdentityPoolIdRegionAndWebSocketUrl: (identityPoolId?: string, region?: string, webSocketUrl?: string) => {
				setState({ identityPoolId, region, webSocketUrl });
			},
			setStackRegion: (stackRegion?: { value: string; label: string }) => {
				setState({ stackRegion });
			},
			setCloudFormationLink: (cloudFormationLink: string) => {
				setState({ cloudFormationLink });
			},
			handleStackRegion: (option: { value: string; label: string }) => {
				const { label, value } = option;
				const newUrl = transformCloudFormationLink(value);

				if (isDesktop) {
					setState({ stackRegion: option, cloudFormationLink: newUrl });
				} else {
					const translatedLabel = t(label);
					const l = translatedLabel.slice(0, translatedLabel.indexOf(")") + 1);
					setState({ stackRegion: { label: l, value }, cloudFormationLink: newUrl });
				}
			},
			resetStore: () => {
				setState({
					credentials: undefined,
					authOptions: undefined,
					authTokens: undefined,
					identityPoolId: undefined,
					region: undefined,
					userDomain: undefined,
					userPoolClientId: undefined,
					userPoolId: undefined,
					webSocketUrl: undefined,
					stackRegion: undefined
				});
				setInitial();
			}
		}),
		[store, authService, setState, t, resetClientStore, resetMapStore, isDesktop, setInitial]
	);

	return { ...methods, ...store };
};

export default useAuth;

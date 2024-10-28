/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useEffect, useMemo } from "react";

import { CognitoIdentity } from "@aws-sdk/client-cognito-identity";
import { showToast } from "@demo/core/Toast";
import appConfig from "@demo/core/constants/appConfig";
import { useClient, useMap, usePlace } from "@demo/hooks";
import { useAuthService } from "@demo/services";
import { useAuthStore } from "@demo/stores";
import { AuthTokensType, ConnectFormValuesType, ToastType } from "@demo/types";
import { EventTypeEnum, RegionEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { errorHandler } from "@demo/utils/errorHandler";
import { getDomainName } from "@demo/utils/getDomainName";
import { setClosestRegion } from "@demo/utils/regionUtils";
import { transformCloudFormationLink } from "@demo/utils/transformCloudFormationLink";
import { useTranslation } from "react-i18next";

import useDeviceMediaQuery from "./useDeviceMediaQuery";

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
	const { resetLocationAndIotClients } = useClient();
	const { resetStore: resetMapStore } = useMap();
	const { resetStore: resetPlaceStore } = usePlace();
	const { t } = useTranslation();
	const { isDesktop } = useDeviceMediaQuery();

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
					const { baseValues, userProvidedValues, authTokens } = store;

					if (userProvidedValues) {
						const { identityPoolId, region, userPoolId } = userProvidedValues;
						const logins = !!authTokens
							? { [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: authTokens.id_token }
							: undefined;
						const cognitoIdentityCredentials = await authService.fetchCredentials(identityPoolId, region, logins);
						setState({ credentials: { ...cognitoIdentityCredentials, authenticated: !!authTokens } });
					} else if (baseValues) {
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
					if ((error as Error).name === "NotAuthorizedException") {
						await methods.refreshTokens();
						resetLocationAndIotClients();
					} else {
						errorHandler(error, t("error_handler__failed_fetch_creds.text"));
					}
				}
			},
			fetchTokens: async (code: string) => {
				try {
					const { userProvidedValues } = store;

					if (userProvidedValues) {
						const { userDomain, userPoolClientId } = userProvidedValues;
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
					const { userProvidedValues, authTokens } = store;

					if (userProvidedValues && authTokens) {
						const { userDomain, userPoolClientId } = userProvidedValues;
						const response = await authService.refreshTokens(userDomain, userPoolClientId, authTokens.refresh_token);

						if (!response.ok) {
							throw new Error(t("error_handler__failed_refresh_tokens.text"));
						}

						const newTokens = await response.json();
						setState({
							authTokens: { ...newTokens, refresh_token: authTokens.refresh_token },
							credentials: undefined
						});
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
				setState({ credentials: undefined });
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
					userProvidedValues: {
						identityPoolId: IdentityPoolId,
						region: IdentityPoolId.split(":")[0],
						userDomain: getDomainName(UserDomain),
						userPoolClientId: UserPoolClientId,
						userPoolId: UserPoolId,
						webSocketUrl: WebSocketUrl
					}
				});
			},
			onLogin: () => {
				try {
					const { userProvidedValues } = store;

					if (userProvidedValues) {
						const { userDomain, userPoolClientId } = userProvidedValues;
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
					const { userProvidedValues } = store;

					if (userProvidedValues) {
						const { userDomain, userPoolClientId } = userProvidedValues;
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
				setState({
					credentials: undefined,
					authTokens: undefined,
					userProvidedValues: undefined
				});
				resetLocationAndIotClients();
				resetMapStore();
				resetPlaceStore();
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
					authTokens: undefined,
					baseValues: undefined,
					userProvidedValues: undefined,
					stackRegion: undefined,
					apiKey: undefined
				});
				setInitial();
			}
		}),
		[authService, store, setState, resetLocationAndIotClients, t, resetMapStore, resetPlaceStore, isDesktop, setInitial]
	);

	return { ...methods, ...store };
};

export default useAuth;

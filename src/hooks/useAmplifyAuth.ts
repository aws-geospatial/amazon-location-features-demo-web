/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useEffect, useMemo } from "react";

import { appConfig, showToast } from "@demo/core";
import { useAmplifyMap, useAws } from "@demo/hooks";
import { useAmplifyAuthService } from "@demo/services";
import { useAmplifyAuthStore } from "@demo/stores";
import { AuthTokensType, ConnectFormValuesType, ToastType } from "@demo/types";
import { EventTypeEnum, RegionEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { errorHandler } from "@demo/utils/errorHandler";
import { getDomainName } from "@demo/utils/getDomainName";
import { clearStorage } from "@demo/utils/localstorageUtils";
import { setClosestRegion } from "@demo/utils/regionUtils";
import { transformCloudFormationLink } from "@demo/utils/transformCloudFormationLink";
import { Amplify, Auth } from "aws-amplify";
import AWS from "aws-sdk";
import { useTranslation } from "react-i18next";

import useDeviceMediaQuery from "./useDeviceMediaQuery";

const {
	POOLS,
	WEB_SOCKET_URLS,
	ROUTES: { DEMO, ERROR_BOUNDARY },
	PERSIST_STORAGE_KEYS: { FASTEST_REGION, LOCAL_APP_VERSION },
	MAP_RESOURCES: { GRAB_SUPPORTED_AWS_REGIONS },
	ENV: { APP_VERSION }
} = appConfig.default;

const fallbackRegion = POOLS[Object.keys(POOLS)[0]];

const useAmplifyAuth = () => {
	const store = useAmplifyAuthStore();
	const { setInitial } = store;
	const { setState } = useAmplifyAuthStore;
	const { getCurrentUserCredentials, login, logout, fetchHostedUi, getCurrentSession } = useAmplifyAuthService();
	const { resetStore: resetAwsStore } = useAws();
	const { resetStore: resetAmplifyMapStore } = useAmplifyMap();
	const { t } = useTranslation();
	const { isDesktop } = useDeviceMediaQuery();

	useEffect(() => {
		const localAppVersion = localStorage.getItem(LOCAL_APP_VERSION) || "";

		if (localAppVersion !== APP_VERSION) {
			localStorage.clear();
			localStorage.setItem(LOCAL_APP_VERSION, APP_VERSION);
		}

		if (!store.identityPoolId) {
			(async () => {
				await setClosestRegion();
				const region = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
				const identityPoolId = POOLS[region];
				const webSocketUrl = WEB_SOCKET_URLS[region];
				setState({ identityPoolId, region, webSocketUrl });
				window.location.reload();
			})();
		}
	}, [store.identityPoolId, setState]);

	const methods = useMemo(
		() => ({
			configureAmplify: (config: unknown) => {
				try {
					Amplify.configure(config);
				} catch (error) {
					errorHandler(error, t("error_handler__failed_configure_amplify.text") as string);
				}
			},
			validateIdentityPoolIdAndRegion: (IdentityPoolId: string, successCb?: () => void) => {
				const cognitoidentity = new AWS.CognitoIdentity({ region: IdentityPoolId.split(":")[0] });
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
			validateDomainAndUserPoolClientId: async (
				domain: string,
				userPoolWebClientId: string,
				successCb?: () => void
			) => {
				try {
					const res = await fetchHostedUi(domain, userPoolWebClientId);

					if (res.ok) {
						successCb && successCb();
					} else {
						console.error({ error: res });
						showToast({ content: t("failed_to_connect_ud_up.text"), type: ToastType.ERROR });
					}
				} catch (error) {
					console.error({ error });
					errorHandler(error, t("failed_to_connect_ud_up.text") as string);
				}
			},
			validateUserPoolId: (config: unknown, successCb?: () => void) => {
				try {
					Auth.configure(config);
					successCb && successCb();
				} catch (error) {
					errorHandler(error, t("error_handler__failed_connect_2.text") as string);
				}
			},
			validateFormValues: (
				identityPoolId: string,
				userPoolId: string,
				userPoolWebClientId: string,
				domain: string,
				webSocketUrl: string,
				successCb?: () => void
			) => {
				/* Validates identityPoolId and region */
				methods.validateIdentityPoolIdAndRegion(
					identityPoolId,
					/* Success callback */
					() => {
						// /* Validates userPoolClientId and domain */
						// methods.validateDomainAndUserPoolClientId(
						// 	domain,
						// 	userPoolWebClientId,
						// 	/* Success callback */
						// 	() => {
						// 		/* Validates userPoolId  */
						// 		methods.validateUserPoolId(
						// 			{
						// 				identityPoolId,
						// 				region: identityPoolId.split(":")[0],
						// 				userPoolId,
						// 				userPoolWebClientId,
						// 				oauth: {
						// 					domain,
						// 					scope: ["email", "openid", "profile"],
						// 					redirectSignIn: `${window.location.origin}${DEMO}`,
						// 					redirectSignOut: `${window.location.origin}${DEMO}`,
						// 					responseType: "token"
						// 				}
						// 			},
						// 			successCb
						// 		);
						// 	}
						// );
						/* Validates userPoolId  */
						methods.validateUserPoolId(
							{
								identityPoolId,
								region: identityPoolId.split(":")[0],
								userPoolId,
								userPoolWebClientId,
								oauth: {
									domain: getDomainName(domain),
									scope: ["email", "openid", "profile"],
									redirectSignIn: `${window.location.origin}${DEMO}`,
									redirectSignOut: `${window.location.origin}${DEMO}`,
									responseType: "token"
								}
							},
							successCb
						);
					}
				);
			},
			getCurrentUserCredentials: async () => {
				try {
					const credentials = await getCurrentUserCredentials();

					if (credentials.identityId) {
						setState({ credentials });
					} else {
						setState({ credentials: undefined });
						window.location.replace(ERROR_BOUNDARY);
					}
				} catch (error) {
					errorHandler(error, t("error_handler__failed_fetch_creds.text") as string);
				}
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
			onLogin: async () => {
				try {
					setState({ authTokens: undefined });
					await login();
				} catch (error) {
					record(
						[{ EventType: EventTypeEnum.SIGN_IN_FAILED, Attributes: { error: JSON.stringify(error) } }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
					errorHandler(error, t("error_handler__failed_sign_in.text") as string);
				}
			},
			onLogout: async () => {
				try {
					await logout();
					setState({ authTokens: undefined });
					record(
						[{ EventType: EventTypeEnum.SIGN_OUT_SUCCESSFUL, Attributes: {} }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
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
				resetAwsStore();
				resetAmplifyMapStore();
				setTimeout(() => window.location.reload(), 3000);
			},
			handleCurrentSession: async (resetAwsStore: () => void) => {
				try {
					await getCurrentSession();
					await methods.getCurrentUserCredentials();
					resetAwsStore();
				} catch (error) {
					console.error("HANDLE_CURRENT_SESSION_ERROR:", JSON.stringify(error));
				}
			},
			switchToGrabMapRegionStack: () => {
				for (const region of GRAB_SUPPORTED_AWS_REGIONS) {
					const identityPoolId = POOLS[region];
					const webSocketUrl = WEB_SOCKET_URLS[region];

					if (identityPoolId) {
						setState({ identityPoolId, region, webSocketUrl, credentials: undefined });
						return;
					}
				}
			},
			switchToDefaultRegionStack: () => {
				const region = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
				const identityPoolId = POOLS[region];
				const webSocketUrl = WEB_SOCKET_URLS[region];

				setState({ identityPoolId, region, webSocketUrl, credentials: undefined });
			},
			setAutoRegion: (autoRegion: boolean, region: "Automatic" | RegionEnum) => {
				if (autoRegion) {
					(async () => {
						await setClosestRegion();
						const region = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
						const identityPoolId = POOLS[region];
						const webSocketUrl = WEB_SOCKET_URLS[region];
						setState({ identityPoolId, region, webSocketUrl, autoRegion, credentials: undefined });
					})();
				} else {
					!!POOLS[region] &&
						!!WEB_SOCKET_URLS[region] &&
						setState({
							identityPoolId: POOLS[region],
							region,
							webSocketUrl: WEB_SOCKET_URLS[region],
							autoRegion,
							credentials: undefined
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
		[
			setInitial,
			setState,
			fetchHostedUi,
			getCurrentUserCredentials,
			login,
			logout,
			getCurrentSession,
			resetAmplifyMapStore,
			resetAwsStore,
			t,
			isDesktop
		]
	);

	return { ...methods, ...store };
};

export default useAmplifyAuth;

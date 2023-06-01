/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { showToast } from "@demo/core/Toast";
import { appConfig } from "@demo/core/constants";
import { useAmplifyMap, useAws } from "@demo/hooks";
import { useAmplifyAuthService } from "@demo/services";
import { useAmplifyAuthStore } from "@demo/stores";
import { AuthTokensType, ConnectFormValuesType, ToastType } from "@demo/types";

import { errorHandler } from "@demo/utils/errorHandler";
import { Amplify, Auth } from "aws-amplify";
import AWS from "aws-sdk";

const {
	ENV: { IDENTITY_POOL_ID, REGION, IDENTITY_POOL_ID_ASIA, REGION_ASIA },
	ROUTES: { DEMO, ERROR_BOUNDARY }
} = appConfig;

const useAmplifyAuth = () => {
	const store = useAmplifyAuthStore();
	const { setInitial } = store;
	const { setState } = useAmplifyAuthStore;
	const { getCurrentUserCredentials, login, logout, fetchHostedUi, getCurrentSession } = useAmplifyAuthService();
	const { resetStore: resetAwsStore } = useAws();
	const { resetStore: resetAmplifyMapStore } = useAmplifyMap();

	const methods = useMemo(
		() => ({
			configureAmplify: (config: unknown) => {
				try {
					Amplify.configure(config);
				} catch (error) {
					errorHandler(error, "Failed to configure amplify");
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
							showToast({
								content: "Failed to connect AWS account, invalid IdentityPoolId or region",
								type: ToastType.ERROR
							});
						} else {
							successCb && successCb();
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
						showToast({
							content: "Failed to connect AWS account, invalid UserDomain or UserPoolClientId",
							type: ToastType.ERROR
						});
					}
				} catch (error) {
					console.error({ error });
					errorHandler(error, "Failed to connect AWS account, invalid UserDomain or UserPoolClientId");
				}
			},
			validateUserPoolId: (config: unknown, successCb?: () => void) => {
				try {
					Auth.configure(config);
					successCb && successCb();
				} catch (error) {
					errorHandler(error, "Failed to connect AWS account, invalid UserPoolId");
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
									domain,
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
					errorHandler(error, "Failed to fetch credentials");
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
					userDomain: UserDomain.slice(8),
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
					errorHandler(error, "Failed to sign in");
				}
			},
			onLogout: async () => {
				try {
					await logout();
					setState({ authTokens: undefined });
				} catch (error) {
					errorHandler(error, "Failed to sign out");
				}
			},
			onDisconnectAwsAccount: () => {
				localStorage.clear();
				methods.resetStore();
				resetAwsStore();
				resetAmplifyMapStore();
				setTimeout(() => {
					window.location.reload();
				}, 3000);
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
			switchToAsiaRegionStack: () => {
				setState({
					identityPoolId: IDENTITY_POOL_ID_ASIA,
					region: REGION_ASIA,
					credentials: undefined
				});
			},
			switchToDefaultRegionStack: () => {
				setState({
					identityPoolId: IDENTITY_POOL_ID,
					region: REGION,
					credentials: undefined
				});
			},
			resetStore: () => {
				setState({
					credentials: undefined,
					authTokens: undefined,
					userDomain: undefined,
					userPoolClientId: undefined,
					userPoolId: undefined,
					webSocketUrl: undefined
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
			resetAwsStore
		]
	);

	return { ...methods, ...store };
};

export default useAmplifyAuth;

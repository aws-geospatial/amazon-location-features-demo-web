/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { FromCognitoIdentityPoolParameters, fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { appConfig } from "@demo/core/constants";

const {
	ROUTES: { DEMO }
} = appConfig;

const useAuthService = () => {
	return useMemo(
		() => ({
			fetchCredentials: async (options: FromCognitoIdentityPoolParameters) => {
				const credentialsProvider = fromCognitoIdentityPool(options);
				return await credentialsProvider();
			},
			fetchTokens: async (userDomain: string, userPoolClientId: string, code: string) => {
				const tokenUrl = `https://${userDomain}/oauth2/token`;
				const body = new URLSearchParams({
					grant_type: "authorization_code",
					client_id: userPoolClientId,
					redirect_uri: `${window.location.origin}${DEMO}`,
					code
				});
				return await fetch(tokenUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					body: body.toString()
				});
			},
			refreshTokens: async (userDomain: string, userPoolClientId: string, refreshToken: string) => {
				const tokenUrl = `https://${userDomain}/oauth2/token`;
				const body = new URLSearchParams({
					grant_type: "refresh_token",
					client_id: userPoolClientId,
					refresh_token: refreshToken
				});
				return await fetch(tokenUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					body: body.toString()
				});
			}
		}),
		[]
	);
};

export default useAuthService;

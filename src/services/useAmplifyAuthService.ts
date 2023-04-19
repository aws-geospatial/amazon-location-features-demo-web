/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import appConfig from "@demo/core/constants/appConfig";
import { Auth } from "aws-amplify";

const useAmplifyAuthService = () => {
	return useMemo(
		() => ({
			fetchHostedUi: async (domain: string, userPoolWebClientId: string) =>
				await fetch(
					`https://${domain}/login?client_id=${userPoolWebClientId}&response_type=token&scope=email+openid+profile&redirect_uri=${window.location.origin}${appConfig.ROUTES.SHOWCASE}`,
					{
						method: "POST",
						headers: {
							"Access-Control-Allow-Origin": "*",
							"Content-Type": "application/x-www-form-urlencoded"
						}
					}
				),
			getCurrentUserCredentials: async () => await Auth.currentUserCredentials(),
			login: async () => await Auth.federatedSignIn(),
			logout: async () => await Auth.signOut()
		}),
		[]
	);
};

export default useAmplifyAuthService;

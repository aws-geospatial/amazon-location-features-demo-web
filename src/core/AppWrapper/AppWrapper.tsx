/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { ReactNode, useMemo } from "react";

import { ThemeProvider } from "@aws-amplify/ui-react";
import appConfig from "@demo/core/constants/appConfig";
import { useAmplifyAuth } from "@demo/hooks";
import { appTheme } from "@demo/theme";
import { EsriMapEnum } from "@demo/types";

import "@aws-amplify/ui-react/styles.css";
import "react-toastify/dist/ReactToastify.min.css";
import "@demo/theme/appStyles.scss";
import "react-tooltip/dist/react-tooltip.css";
import "mapbox-gl/dist/mapbox-gl.css";

const {
	ROUTES: { SHOWCASE },
	MAP_ITEMS
} = appConfig;

interface AppWrapperProps {
	children?: ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
	const { identityPoolId, region, userPoolId, userPoolClientId, userDomain, configureAmplify } = useAmplifyAuth();

	const amplifyConfig = useMemo(
		() => ({
			Auth:
				userPoolId && userPoolClientId && userDomain
					? {
							identityPoolId,
							region,
							userPoolId,
							userPoolWebClientId: userPoolClientId,
							oauth: {
								domain: userDomain,
								scope: ["email", "openid", "profile"],
								redirectSignIn: `${window.location.origin}${SHOWCASE}`,
								redirectSignOut: `${window.location.origin}${SHOWCASE}?sign_out=true`,
								responseType: "token"
							}
					  }
					: {
							identityPoolId,
							region
					  },
			geo: {
				AmazonLocationService: {
					maps: {
						items: MAP_ITEMS,
						default: EsriMapEnum.ESRI_LIGHT
					},
					region
				}
			}
		}),
		[identityPoolId, region, userPoolId, userPoolClientId, userDomain]
	);

	/* Configure Auth and Geo via amplify */
	configureAmplify(amplifyConfig);

	return (
		<ThemeProvider theme={appTheme} nonce="dAnIsRazNonCe">
			{children}
		</ThemeProvider>
	);
};

export default AppWrapper;

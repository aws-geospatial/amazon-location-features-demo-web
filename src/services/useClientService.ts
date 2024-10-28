/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { GeoPlacesClient } from "@aws-sdk/client-geoplaces";
import { GeoRoutesClient } from "@aws-sdk/client-georoutes";
import { IoT } from "@aws-sdk/client-iot";
import { Location } from "@aws-sdk/client-location";
import { LocationClientConfig } from "@aws/amazon-location-utilities-auth-helper";
import { CognitoIdentityCredentials } from "@demo/types";

const useClientService = () => {
	return useMemo(
		() => ({
			createPlacesClient: (locationClientConfig: LocationClientConfig) =>
				new GeoPlacesClient({ ...locationClientConfig }),
			createRoutesClient: (locationClientConfig: LocationClientConfig, region: string) =>
				new GeoRoutesClient({ ...locationClientConfig, endpoint: `https://geo.${region}.amazonaws.com/v2` }), // TODO: Remove endpoint when the SDK supports it
			createLocationClient: (credentials: CognitoIdentityCredentials, region: string) =>
				new Location({
					credentials,
					region
				}),
			createIotClient: (credentials: CognitoIdentityCredentials, region: string) =>
				new IoT({
					credentials,
					region
				})
		}),
		[]
	);
};

export default useClientService;

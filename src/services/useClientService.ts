/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { LocationClientConfig } from "@aws/amazon-location-utilities-auth-helper";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";
import { GeoRoutesClient } from "@aws-sdk/client-geo-routes";
import { IoT } from "@aws-sdk/client-iot";
import { Location } from "@aws-sdk/client-location";
import { CognitoIdentityCredentials } from "@demo/types";

const useClientService = () => {
	return useMemo(
		() => ({
			createPlacesClient: (locationClientConfig: LocationClientConfig) => new GeoPlacesClient(locationClientConfig),
			createRoutesClient: (locationClientConfig: LocationClientConfig) => new GeoRoutesClient(locationClientConfig),
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

/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { IoT } from "@aws-sdk/client-iot";
import { Location } from "@aws-sdk/client-location";
import { CognitoIdentityCredentials } from "@demo/types";

const useClientService = () => {
	return useMemo(
		() => ({
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

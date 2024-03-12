/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { ICredentials } from "@aws-amplify/core";
import { IoT } from "@aws-sdk/client-iot";
import { Location } from "@aws-sdk/client-location";

const useAwsService = () => {
	return useMemo(
		() => ({
			createLocationClient: (credentials: ICredentials, region: string) =>
				new Location({
					credentials,
					region
					// signatureCache: false
				}),
			createIotClient: (credentials: ICredentials, region: string) =>
				new IoT({
					credentials,
					region
					// signatureCache: false
				})
		}),
		[]
	);
};

export default useAwsService;

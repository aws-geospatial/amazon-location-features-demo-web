/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { ICredentials } from "@aws-amplify/core";
import Iot from "aws-sdk/clients/iot";
import Location from "aws-sdk/clients/location";

const useAwsService = () => {
	return useMemo(
		() => ({
			createLocationClient: (credentials: ICredentials, region: string) =>
				new Location({ credentials, region, signatureCache: false }),
			createIotClient: (credentials: ICredentials, region: string) =>
				new Iot({ credentials, region, signatureCache: false })
		}),
		[]
	);
};

export default useAwsService;

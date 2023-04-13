/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { ICredentials } from "@aws-amplify/core";
import AWS from "aws-sdk";

const useAwsService = () => {
	return useMemo(
		() => ({
			createLocationClient: (credentials: ICredentials, region: string) => new AWS.Location({ credentials, region }),
			createIotClient: (credentials: ICredentials, region: string) => new AWS.Iot({ credentials, region })
		}),
		[]
	);
};

export default useAwsService;

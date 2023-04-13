/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useAws } from "@demo/hooks";
import { Iot } from "aws-sdk";

const useAwsIotService = () => {
	const { iotClient } = useAws();

	return useMemo(
		() => ({
			attachPolicy: async (identityId: string) => {
				const params: Iot.AttachPolicyRequest = {
					policyName: "AmazonLocationIotPolicy",
					target: identityId
				};

				return await iotClient?.attachPolicy(params).promise();
			},
			detachPolicy: async (identityId: string) => {
				const params: Iot.AttachPolicyRequest = {
					policyName: "AmazonLocationIotPolicy",
					target: identityId
				};

				return await iotClient?.detachPolicy(params).promise();
			}
		}),
		[iotClient]
	);
};

export default useAwsIotService;

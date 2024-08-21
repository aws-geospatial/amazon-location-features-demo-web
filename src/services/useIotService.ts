/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { AttachPolicyRequest } from "@aws-sdk/client-iot";
import { useClient } from "@demo/hooks";

const useIotService = () => {
	const { iotClient } = useClient();

	return useMemo(
		() => ({
			attachPolicy: async (identityId: string, unauthUser = false) => {
				const params: AttachPolicyRequest = {
					policyName: unauthUser ? "AmazonLocationIotPolicyUnauth" : "AmazonLocationIotPolicy",
					target: identityId
				};

				return await iotClient?.attachPolicy(params);
			},
			detachPolicy: async (identityId: string, unauthUser = false) => {
				const params: AttachPolicyRequest = {
					policyName: unauthUser ? "AmazonLocationIotPolicyUnauth" : "AmazonLocationIotPolicy",
					target: identityId
				};

				return await iotClient?.detachPolicy(params);
			}
		}),
		[iotClient]
	);
};

export default useIotService;

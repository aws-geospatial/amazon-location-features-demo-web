/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useIotService } from "@demo/services";
import { errorHandler } from "@demo/utils/errorHandler";

const useIot = () => {
	const iotService = useIotService();

	const methods = useMemo(
		() => ({
			attachPolicy: async (identityId: string) => {
				try {
					await iotService.attachPolicy(identityId);
				} catch (error) {
					errorHandler(error);
				}
			},
			detachPolicy: async (identityId: string) => {
				try {
					await iotService.detachPolicy(identityId);
				} catch (error) {
					errorHandler(error);
				}
			}
		}),
		[iotService]
	);

	return useMemo(() => ({ ...methods }), [methods]);
};

export default useIot;

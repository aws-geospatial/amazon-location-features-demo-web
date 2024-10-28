/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { CalculateRoutesCommand, CalculateRoutesCommandInput } from "@aws-sdk/client-georoutes";
import { useClient } from "@demo/hooks";

const useRouteService = () => {
	const { routesClient } = useClient();

	return useMemo(
		() => ({
			calculateRoutes: async (params: CalculateRoutesCommandInput) => {
				const input: CalculateRoutesCommandInput = {
					...params,
					DepartNow: true,
					LegGeometryFormat: "Simple",
					TravelStepType: "Default",
					LegAdditionalFeatures: ["TravelStepInstructions", "Summary"],
					MaxAlternatives: 0
				};
				const command = new CalculateRoutesCommand(input);
				return await routesClient?.send(command);
			}
		}),
		[routesClient]
	);
};

export default useRouteService;

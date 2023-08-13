/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { appConfig } from "@demo/core/constants";
import { useAws } from "@demo/hooks";
import { MapProviderEnum } from "@demo/types";
import { CalculateRouteRequest } from "aws-sdk/clients/location";

const {
	MAP_RESOURCES: {
		ROUTE_CALCULATORS: { ESRI, HERE, GRAB }
	}
} = appConfig;

const useAwsRouteService = () => {
	const { locationClient } = useAws();

	return useMemo(
		() => ({
			calculateRoute: async (params: CalculateRouteRequest, mapProvider: MapProviderEnum) =>
				await locationClient
					?.calculateRoute({
						...params,
						CalculatorName:
							mapProvider === MapProviderEnum.ESRI || mapProvider === MapProviderEnum.OPEN_DATA
								? ESRI
								: mapProvider === MapProviderEnum.HERE
								? HERE
								: mapProvider === MapProviderEnum.GRAB
								? GRAB
								: "",
						DepartNow: true
					})
					.promise()
		}),
		[locationClient]
	);
};

export default useAwsRouteService;

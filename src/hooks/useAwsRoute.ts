/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useAwsRouteService } from "@demo/services";
import { useAmplifyMapStore, useAwsRouteStore } from "@demo/stores";
import { InputType, RouteDataType, RouteOptionsType, SuggestionType } from "@demo/types";

import { errorHandler } from "@demo/utils/errorHandler";
import { CalculateRouteRequest, Position } from "aws-sdk/clients/location";

const useAwsRoute = () => {
	const store = useAwsRouteStore();
	const { setInitial } = store;
	const { setState } = useAwsRouteStore;
	const routesService = useAwsRouteService();
	const mapStore = useAmplifyMapStore();

	const methods = useMemo(
		() => ({
			getRoute: async (params: CalculateRouteRequest) => {
				try {
					setState({ isFetchingRoute: true });
					const routeData = await routesService.calculateRoute(params, mapStore.mapProvider);
					return routeData;
				} catch (error) {
					errorHandler(error, "Failed to calculate route");
				} finally {
					setState({ isFetchingRoute: false });
				}
			},
			setRoutePositions: (p: Position | undefined, type: InputType) => {
				setState(s => ({
					routePositions:
						type === InputType.FROM ? { from: p, to: s.routePositions?.to } : { from: s.routePositions?.from, to: p }
				}));
			},
			setRouteData: (routeData?: RouteDataType) => {
				setState({ routeData });
			},
			setDirections: (directions?: { info: SuggestionType; isEsriLimitation: boolean }) => {
				setState({ directions });
			},
			setDefaultRouteOptions: (defaultRouteOptions: RouteOptionsType) => {
				setState({ defaultRouteOptions });
			},
			resetStore: () => {
				setState({ routePositions: undefined, routeData: undefined, directions: undefined });
				setInitial();
			}
		}),
		[setInitial, setState, routesService, mapStore.mapProvider]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useAwsRoute;

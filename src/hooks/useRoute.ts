/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { CalculateRouteRequest } from "@aws-sdk/client-location";
import { useRouteService } from "@demo/services";
import { useMapStore, useRouteStore } from "@demo/stores";
import { InputType, RouteDataType, SuggestionType } from "@demo/types";
import { EventTypeEnum, TriggeredByEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { errorHandler } from "@demo/utils/errorHandler";
import { useTranslation } from "react-i18next";

const useRoute = () => {
	const store = useRouteStore();
	const { setInitial } = store;
	const { setState } = useRouteStore;
	const routeService = useRouteService();
	const mapStore = useMapStore();
	const { t } = useTranslation();

	const methods = useMemo(
		() => ({
			getRoute: async (params: CalculateRouteRequest, triggeredBy: TriggeredByEnum) => {
				try {
					setState({ isFetchingRoute: true });
					const routeData = await routeService.calculateRoute(params, mapStore.mapProvider);
					return routeData;
				} catch (error) {
					errorHandler(error, `${t("error_handler__failed_calculate_route.text") as string} (${params.TravelMode})`);
				} finally {
					setState({ isFetchingRoute: false });

					const recordAttributes: { [key: string]: string } = {
						travelMode: params.TravelMode || "N/A",
						distanceUnit: params.DistanceUnit || "N/A",
						triggeredBy: String(triggeredBy)
					};

					const modeOptions = {
						...(params.CarModeOptions ? params.CarModeOptions : {}),
						...(params.TruckModeOptions ? params.TruckModeOptions : {})
					};

					for (const [key, value] of Object.entries(modeOptions)) {
						recordAttributes[key] = String(value);
					}

					record([{ EventType: EventTypeEnum.ROUTE_SEARCH, Attributes: recordAttributes }]);
				}
			},
			setRoutePositions: (p: number[] | undefined, type: InputType) => {
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
			resetStore: () => {
				setState({ routePositions: undefined, routeData: undefined, directions: undefined });
				setInitial();
			}
		}),
		[setInitial, setState, routeService, mapStore.mapProvider, t]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useRoute;

/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { appConfig } from "@demo/core/constants";
import { useAmplifyMapService } from "@demo/services";
import { useAmplifyMapStore } from "@demo/stores";
import {
	CurrentLocationDataType,
	EsriMapEnum,
	GrabMapEnum,
	HereMapEnum,
	MapProviderEnum,
	MapUnitEnum
} from "@demo/types";

import { errorHandler } from "@demo/utils/errorHandler";

const {
	MAP_RESOURCES: { IMPERIAL_COUNTRIES }
} = appConfig;
const { IMPERIAL, METRIC } = MapUnitEnum;

const useAmplifyMap = () => {
	const store = useAmplifyMapStore();
	const { setInitial } = store;
	const { setState } = useAmplifyMapStore;
	const mapsService = useAmplifyMapService();

	const methods = useMemo(
		() => ({
			getDefaultMap: () => {
				try {
					return mapsService.getDefaultMap();
				} catch (error) {
					errorHandler(error, "Failed to fetch default map");
				}
			},
			getAvailableMaps: () => {
				try {
					return mapsService.getAvailableMaps();
				} catch (error) {
					errorHandler(error, "Failed to fetch available maps");
				}
			},
			setCurrentLocation: (currentLocationData: CurrentLocationDataType) => {
				setState({ currentLocationData });
			},
			setIsAutomaticMapUnit: (isAutomaticMapUnit: boolean) => {
				setState({ isAutomaticMapUnit });
			},
			setAutomaticMapUnit: () => {
				if (store.isAutomaticMapUnit) {
					const isMetric = !IMPERIAL_COUNTRIES.includes(navigator.language.split("-")[1]);
					isMetric ? setState({ mapUnit: METRIC }) : setState({ mapUnit: IMPERIAL });
				}
			},
			setMapUnit: (mapUnit: MapUnitEnum) => {
				setState({ mapUnit });
			},
			setMapProvider: (mapProvider: MapProviderEnum) => {
				setState({ mapProvider });
			},
			setMapStyle: (mapStyle: EsriMapEnum | HereMapEnum | GrabMapEnum) => {
				setState({ mapStyle });
			},
			setAttributionText: (attributionText: string) => {
				setState({ attributionText });
			},
			setIsCurrentLocationDisabled: (isCurrentLocationDisabled: boolean) => {
				setState({ isCurrentLocationDisabled });
			},
			resetStore() {
				setState({
					currentLocationData: undefined
				});
				setInitial();
			}
		}),
		[mapsService, setState, store.isAutomaticMapUnit, setInitial]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useAmplifyMap;

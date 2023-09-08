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
	MapUnitEnum,
	ViewPointType
} from "@demo/types";

import { OpenDataMapEnum } from "@demo/types/Enums";
import { errorHandler } from "@demo/utils/errorHandler";
import { useTranslation } from "react-i18next";

const {
	MAP_RESOURCES: { IMPERIAL_COUNTRIES },
	ROUTES: { DEMO },
	GET_PARAMS: { DATA_PROVIDER }
} = appConfig;
const { IMPERIAL, METRIC } = MapUnitEnum;

const useAmplifyMap = () => {
	const store = useAmplifyMapStore();
	const { setInitial } = store;
	const { setState } = useAmplifyMapStore;
	const mapsService = useAmplifyMapService();
	const { t } = useTranslation();

	const methods = useMemo(
		() => ({
			getDefaultMap: () => {
				try {
					return mapsService.getDefaultMap();
				} catch (error) {
					errorHandler(error, t("error_handler__failed_fetch_default_map.text") as string);
				}
			},
			getAvailableMaps: () => {
				try {
					return mapsService.getAvailableMaps();
				} catch (error) {
					errorHandler(error, t("error_handler__failed_fetch_available_map.text") as string);
				}
			},
			setCurrentLocation: (currentLocationData: CurrentLocationDataType) => {
				setState({ currentLocationData });
			},
			setViewpoint: (viewpoint: ViewPointType) => {
				setState({ viewpoint });
			},
			setIsAutomaticMapUnit: (selected: boolean) => {
				setState(s => ({ autoMapUnit: { ...s.autoMapUnit, selected } }));
			},
			setAutomaticMapUnit: () => {
				const isMetric = !IMPERIAL_COUNTRIES.includes(navigator.language.split("-")[1]);
				const mapUnit = isMetric ? METRIC : IMPERIAL;
				setState(s => ({ autoMapUnit: { ...s.autoMapUnit, system: mapUnit }, mapUnit }));
			},
			setMapUnit: (mapUnit: MapUnitEnum) => {
				setState({ mapUnit });
			},
			setMapProvider: (mapProvider: MapProviderEnum) => {
				if (DEMO === location.pathname) {
					const newurl = `${location.protocol}//${location.host}${location.pathname}?${DATA_PROVIDER}=${mapProvider}`;
					history.pushState({ path: newurl }, "", newurl);
				}

				setState({ mapProvider });
			},
			setMapStyle: (mapStyle: EsriMapEnum | HereMapEnum | GrabMapEnum | OpenDataMapEnum) => {
				setState({ mapStyle });
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
		[mapsService, setState, setInitial, t]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useAmplifyMap;

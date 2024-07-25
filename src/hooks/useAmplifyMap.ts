/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { appConfig } from "@demo/core/constants";
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
import { getCountryCode } from "@demo/utils/countryUtil";

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

	const methods = useMemo(
		() => ({
			setCurrentLocation: (currentLocationData: CurrentLocationDataType) => {
				setState({ currentLocationData });
			},
			setViewpoint: (viewpoint: ViewPointType) => {
				setState({ viewpoint });
			},
			setIsAutomaticMapUnit: (selected: boolean) => {
				setState(s => ({ autoMapUnit: { ...s.autoMapUnit, selected } }));
			},
			setAutomaticMapUnit: async () => {
				const countryCode = await getCountryCode();
				const isImperial = !!countryCode && IMPERIAL_COUNTRIES.includes(countryCode);
				const mapUnit = isImperial ? IMPERIAL : METRIC;
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
		[setState, setInitial]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useAmplifyMap;

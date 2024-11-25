/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { appConfig } from "@demo/core/constants";
import {
	CurrentLocationDataType,
	IStateProps,
	MapColorSchemeEnum,
	MapStyleEnum,
	MapUnitEnum,
	ViewPointType
} from "@demo/types";

import createStore from "./createStore";

const {
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, MAP_DATA },
	MAP_RESOURCES: {
		AMAZON_HQ: { US }
	}
} = appConfig;
const localStorageKey = `${LOCAL_STORAGE_PREFIX}${MAP_DATA}`;

interface MapStoreProps {
	currentLocationData?: CurrentLocationDataType;
	viewpoint: ViewPointType;
	autoMapUnit: {
		selected: boolean;
		system: MapUnitEnum;
	};
	mapUnit: MapUnitEnum;
	mapStyle: MapStyleEnum;
	mapColorScheme: MapColorSchemeEnum;
	mapPoliticalView: { alpha2: string; alpha3: string; desc: string };
	biasPosition: number[];
}

const initialState: IStateProps<MapStoreProps> = {
	viewpoint: US,
	autoMapUnit: {
		selected: true,
		system: MapUnitEnum.IMPERIAL
	},
	mapUnit: MapUnitEnum.IMPERIAL,
	mapStyle: MapStyleEnum.STANDARD,
	mapColorScheme: MapColorSchemeEnum.LIGHT,
	mapPoliticalView: {
		alpha2: "",
		alpha3: "",
		desc: "no_political_view.text"
	},
	biasPosition: [US.longitude, US.latitude]
};

export default createStore<MapStoreProps>(initialState, true, localStorageKey);

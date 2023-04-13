/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import appConfig from "@demo/core/constants/appConfig";
import { useAws } from "@demo/hooks";
import { MapProviderEnum, ViewPointType } from "@demo/types";
import {
	GetPlaceRequest,
	Position,
	SearchPlaceIndexForPositionRequest,
	SearchPlaceIndexForSuggestionsRequest,
	SearchPlaceIndexForTextRequest
} from "aws-sdk/clients/location";

const {
	PLACE_INDEXES: { ESRI, HERE }
} = appConfig;

const useAwsPlaceService = (mapProvider: MapProviderEnum, viewpoint?: ViewPointType) => {
	const { locationClient } = useAws();

	const config = useMemo(
		() => ({
			IndexName: mapProvider === MapProviderEnum.ESRI ? ESRI : HERE,
			Language: "en"
		}),
		[mapProvider]
	);

	return useMemo(
		() => ({
			getPlaceSuggestions: async (Text: string) => {
				const params: SearchPlaceIndexForSuggestionsRequest = {
					...config,
					BiasPosition: [viewpoint?.longitude as number, viewpoint?.latitude as number],
					Text
				};

				return await locationClient?.searchPlaceIndexForSuggestions(params).promise();
			},
			getPlaceById: async (PlaceId: string) => {
				const params: GetPlaceRequest = {
					...config,
					PlaceId
				};

				return await locationClient?.getPlace(params).promise();
			},
			getPlacesByText: async (Text: string) => {
				const params: SearchPlaceIndexForTextRequest = {
					...config,
					BiasPosition: [viewpoint?.longitude as number, viewpoint?.latitude as number],
					Text
				};

				return await locationClient?.searchPlaceIndexForText(params).promise();
			},
			getPlaceByCoordinates: async (Position: Position) => {
				const params: SearchPlaceIndexForPositionRequest = {
					...config,
					Position
				};

				return await locationClient?.searchPlaceIndexForPosition(params).promise();
			}
		}),
		[config, locationClient, viewpoint]
	);
};

export default useAwsPlaceService;

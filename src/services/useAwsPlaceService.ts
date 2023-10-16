/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { appConfig } from "@demo/core/constants";
import { useAmplifyMap, useAws } from "@demo/hooks";
import { MapProviderEnum } from "@demo/types";
import {
	GetPlaceRequest,
	Position,
	SearchPlaceIndexForPositionRequest,
	SearchPlaceIndexForSuggestionsRequest,
	SearchPlaceIndexForTextRequest
} from "aws-sdk/clients/location";
import { useTranslation } from "react-i18next";

const {
	MAP_RESOURCES: {
		PLACE_INDEXES: { ESRI, HERE, GRAB }
	},
	ENV: { NL_BASE_URL, NL_API_KEY }
} = appConfig;

const useAwsPlaceService = () => {
	const { locationClient } = useAws();
	const { mapProvider: currentMapProvider, viewpoint } = useAmplifyMap();
	const { i18n } = useTranslation();
	const lang = i18n.language;

	const config = useMemo(
		() => ({
			IndexName:
				currentMapProvider === MapProviderEnum.ESRI || currentMapProvider === MapProviderEnum.OPEN_DATA
					? ESRI
					: currentMapProvider === MapProviderEnum.HERE
					? HERE
					: currentMapProvider === MapProviderEnum.GRAB
					? GRAB
					: "",
			Language: lang
		}),
		[currentMapProvider, lang]
	);

	return useMemo(
		() => ({
			getPlaceSuggestions: async (Text: string) => {
				const params: SearchPlaceIndexForSuggestionsRequest = {
					...config,
					BiasPosition:
						currentMapProvider !== MapProviderEnum.GRAB
							? [viewpoint?.longitude as number, viewpoint?.latitude as number]
							: undefined,
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
					BiasPosition:
						currentMapProvider !== MapProviderEnum.GRAB
							? [viewpoint?.longitude as number, viewpoint?.latitude as number]
							: undefined,
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
			},
			getNLPlacesByText: async (Text: string) => {
				const response = await fetch(`${NL_BASE_URL}/places/ask?` + new URLSearchParams({ Text: Text }), {
					method: "GET",
					headers: {
						"x-api-key": NL_API_KEY
					}
				});
				return await response.json();
			}
		}),
		[config, locationClient, currentMapProvider, viewpoint]
	);
};

export default useAwsPlaceService;

/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import {
	GetPlaceCommand,
	GetPlaceCommandInput,
	ReverseGeocodeCommand,
	ReverseGeocodeCommandInput,
	SearchTextCommand,
	SearchTextCommandInput,
	SuggestCommand,
	SuggestCommandInput
} from "@aws-sdk/client-geo-places";
import { appConfig } from "@demo/core/constants";
import { useClient, useMap } from "@demo/hooks";
import { useTranslation } from "react-i18next";

const {
	ENV: { NL_BASE_URL, NL_API_KEY }
} = appConfig;

const usePlaceService = () => {
	const { placesClient } = useClient();
	const { viewpoint } = useMap();
	const { i18n } = useTranslation();
	const Language = i18n.language;

	return useMemo(
		() => ({
			getPlaceSuggestions: async (QueryText: string) => {
				const input: SuggestCommandInput = {
					QueryText,
					BiasPosition: [viewpoint?.longitude as number, viewpoint?.latitude as number],
					Language,
					AdditionalFeatures: ["Core"]
				};
				const command = new SuggestCommand(input);
				return await placesClient?.send(command);
			},
			getPlaceById: async (PlaceId: string) => {
				const input: GetPlaceCommandInput = {
					PlaceId,
					Language,
					AdditionalFeatures: ["Contact"]
				};
				const command = new GetPlaceCommand(input);
				return await placesClient?.send(command);
			},
			getPlacesByText: async (QueryTextOrId: string, isQueryId = false) => {
				const input: SearchTextCommandInput = {
					QueryText: isQueryId ? undefined : QueryTextOrId,
					QueryId: isQueryId ? QueryTextOrId : undefined,
					BiasPosition: isQueryId ? undefined : [viewpoint?.longitude as number, viewpoint?.latitude as number],
					Language: isQueryId ? undefined : Language
				};
				const command = new SearchTextCommand(input);
				return await placesClient?.send(command);
			},
			getPlaceByCoordinates: async (QueryPosition: number[]) => {
				const input: ReverseGeocodeCommandInput = {
					QueryPosition,
					Language
				};
				const command = new ReverseGeocodeCommand(input);
				return await placesClient?.send(command);
			},
			getNLPlacesByText: async (Text: string) => {
				const BiasPosition = [viewpoint?.longitude as number, viewpoint?.latitude as number];
				const response = await fetch(
					`${NL_BASE_URL}/places/ask?` +
						new URLSearchParams([
							["Text", Text],
							["BiasPosition", BiasPosition[0].toString()],
							["BiasPosition", BiasPosition[1].toString()],
							["DataSource", "Here"]
						]),
					{
						method: "GET",
						headers: {
							"x-api-key": NL_API_KEY
						}
					}
				);
				const responseBody = await response.json();
				if (response.status !== 200) {
					throw new Error(responseBody.message);
				}
				return responseBody;
			}
		}),
		[viewpoint, Language, placesClient]
	);
};

export default usePlaceService;

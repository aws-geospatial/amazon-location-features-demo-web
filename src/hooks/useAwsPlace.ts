/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useAmplifyMap } from "@demo/hooks";
import { useAwsPlaceService } from "@demo/services";
import { useAwsPlaceStore } from "@demo/stores";
import { ClustersType, SuggestionType, ViewPointType } from "@demo/types";
import { EventTypeEnum, TriggeredByEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { errorHandler } from "@demo/utils/errorHandler";
import { calculateClusters, getHash, getPrecision, isGeoString } from "@demo/utils/geoCalculation";
import { Position } from "aws-sdk/clients/location";
import { useTranslation } from "react-i18next";

const useAwsPlace = () => {
	const store = useAwsPlaceStore();
	const { setInitial } = store;
	const { setState } = useAwsPlaceStore;
	const { setViewpoint } = useAmplifyMap();
	const placesService = useAwsPlaceService();
	const { t } = useTranslation();

	const methods = useMemo(
		() => ({
			setSearchingState: (isSearching = true) => {
				setState({ isSearching });
			},
			searchPlaceSuggestions: async (value: string, viewpoint: ViewPointType, cb?: (sg: SuggestionType[]) => void) => {
				try {
					setState({ isSearching: true });
					const data = await placesService.getPlaceSuggestions(value);
					cb
						? cb(data?.Results.map(({ PlaceId, Text }) => ({ PlaceId, Text })) as SuggestionType[])
						: setState({
								suggestions: data?.Results.map(({ PlaceId, Text }) => ({ PlaceId, Text }))
						  });
					setState({
						bound: undefined
					});
					setViewpoint(viewpoint);
				} catch (error) {
					errorHandler(error, t("error_handler__failed_search_place_suggestions.text") as string);
				} finally {
					setState({ isSearching: false });
				}
			},
			getPlaceData: async (placeId: string) => {
				try {
					setState({ isFetchingPlaceData: true });
					const data = await placesService.getPlaceById(placeId);
					return data;
				} catch (error) {
					errorHandler(error, t("error_handler__failed_fetch_place_id.text") as string);
				} finally {
					setState({ isFetchingPlaceData: false });
				}
			},
			searchPlacesByText: async (value: string, viewpoint: ViewPointType, cb?: (sg: SuggestionType[]) => void) => {
				try {
					setState({ isSearching: true });
					const data = await placesService.getPlacesByText(value);
					const clusters: ClustersType = {};
					const suggestions = data?.Results?.map(p => {
						const Hash = getHash(p.Place.Geometry.Point as Position, store.precision);
						const sg = {
							...p,
							Hash
						} as SuggestionType;
						clusters[Hash] = clusters[Hash] ? [...clusters[Hash], sg] : [sg];
						return sg;
					});
					cb ? cb(suggestions as SuggestionType[]) : setState({ suggestions });
					setState({
						bound: data?.Summary.ResultBBox,
						clusters
					});
					setViewpoint(viewpoint);
				} catch (error) {
					errorHandler(error, t("error_handler__failed_search_place_text.text") as string);
				} finally {
					setState({ isSearching: false });
				}
			},
			getPlaceDataByCoordinates: async (input: Position) => {
				try {
					return await placesService.getPlaceByCoordinates(input);
				} catch (error) {
					errorHandler(error, t("error_handler__failed_fetch_place_coords.text") as string);
				}
			},
			searchPlacesByCoordinates: async (
				value: string,
				viewpoint: ViewPointType,
				cb?: (sg: SuggestionType[]) => void
			) => {
				try {
					setState({ isSearching: true });
					const [lat, lng] = value.split(",");
					const data = await placesService.getPlaceByCoordinates([parseFloat(lng), parseFloat(lat)]);
					const vPoint = data
						? { longitude: data.Summary.Position[0] || 0, latitude: data.Summary.Position[1] || 0 }
						: viewpoint;
					const Hash = getHash([vPoint.longitude, vPoint.latitude], 10);
					const suggestion = { ...data?.Results[0], Hash };
					cb ? cb([suggestion]) : setState({ suggestions: [suggestion] });
					setState({ bound: undefined });
					setViewpoint(vPoint);
				} catch (error) {
					errorHandler(error, t("error_handler__failed_search_place_coords.text") as string);
				} finally {
					setState({ isSearching: false });
				}
			},
			search: async (
				value: string,
				viewpoint: ViewPointType,
				exact: boolean,
				cb: ((sg: SuggestionType[]) => void) | undefined,
				triggeredBy: TriggeredByEnum,
				action: string
			) => {
				if (isGeoString(value)) {
					await methods.searchPlacesByCoordinates(value, viewpoint, cb);
				} else if (exact) {
					await methods.searchPlacesByText(value, viewpoint, cb);
				} else if (value?.length) {
					await methods.searchPlaceSuggestions(value, viewpoint, cb);
				}

				record([
					{
						EventType: EventTypeEnum.PLACE_SEARCH,
						Attributes: {
							exact: String(exact),
							type: isGeoString(value) ? "Coordinates" : "Text",
							triggeredBy,
							action
						}
					}
				]);
			},
			setZoom: (zoom: number) => {
				setState(s => {
					const v = Math.round(s.clusterZoom - zoom);
					if (s.clusters && s.suggestions && s.suggestions.length > 1 && Math.abs(v) >= 1) {
						const precision = getPrecision(zoom, s.precision);
						const clusters = calculateClusters(s.suggestions, precision);
						return { zoom, clusterZoom: Math.round(zoom), precision, clusters };
					}
					return { zoom };
				});
			},
			setMarker: (marker?: Omit<ViewPointType, "zoom" | "info">) => {
				setState({ marker });
			},
			setSelectedMarker: async (selectedMarker?: SuggestionType) => {
				if (selectedMarker === undefined) {
					setState({ selectedMarker });
					return;
				}

				let coords;

				if (!selectedMarker.PlaceId) {
					const { Place } = selectedMarker;
					coords = Place?.Geometry.Point;
				} else {
					try {
						const pd = await placesService.getPlaceById(selectedMarker.PlaceId);
						coords = pd?.Place.Geometry.Point;
					} catch (error) {
						errorHandler(error, t("error_handler__failed_fetch_place_id_marker.text") as string);
					}
				}

				const [longitude, latitude] = coords as Position;
				setState({ selectedMarker, hoveredMarker: undefined, zoom: 15 });
				setViewpoint({ longitude, latitude });
			},
			setHoveredMarker: (hoveredMarker?: SuggestionType) => {
				setState({ hoveredMarker });
			},
			clearPoiList: () => {
				setState({
					suggestions: undefined,
					selectedMarker: undefined,
					marker: undefined,
					bound: undefined,
					clusters: undefined
				});
			},
			resetStore() {
				setState({
					bound: undefined,
					clusters: undefined,
					suggestions: undefined,
					selectedMarker: undefined,
					hoveredMarker: undefined,
					marker: undefined
				});
				setInitial();
			}
		}),
		[placesService, setState, store.precision, setInitial, setViewpoint, t]
	);
	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useAwsPlace;

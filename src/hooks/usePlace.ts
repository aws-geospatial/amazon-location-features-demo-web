/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { SearchForTextResult } from "@aws-sdk/client-location";
import { useMap } from "@demo/hooks";
import { usePlaceService } from "@demo/services";
import { usePlaceStore } from "@demo/stores";
import { ClustersType, SuggestionType, ViewPointType } from "@demo/types";
import { AnalyticsPlaceSearchTypeEnum, EventTypeEnum, TriggeredByEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { errorHandler } from "@demo/utils/errorHandler";
import { calculateClusters, getHash, getPrecision, isGeoString } from "@demo/utils/geoCalculation";
import { uuid } from "@demo/utils/uuid";
import { useTranslation } from "react-i18next";

const usePlace = () => {
	const store = usePlaceStore();
	const { setInitial } = store;
	const { setState } = usePlaceStore;
	const { setViewpoint } = useMap();
	const placeService = usePlaceService();
	const { t } = useTranslation();

	const methods = useMemo(
		() => ({
			setSearchingState: (isSearching = true) => {
				setState({ isSearching });
			},
			searchPlaceSuggestions: async (value: string, viewpoint: ViewPointType, cb?: (sg: SuggestionType[]) => void) => {
				try {
					setState({ isSearching: true });
					const data = await placeService.getPlaceSuggestions(value);
					cb
						? cb(data?.Results?.map(({ PlaceId, Text }) => ({ PlaceId, Text })) as SuggestionType[])
						: setState({
								suggestions: data?.Results?.map(({ PlaceId, Text }) => ({ PlaceId, Text, Id: uuid.randomUUID() }))
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
					const data = await placeService.getPlaceById(placeId);
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
					const data = await placeService.getPlacesByText(value);
					const clusters: ClustersType = {};
					const suggestions = data?.Results?.map(p => {
						const Hash = getHash(p.Place?.Geometry?.Point as number[], store.precision);
						const sg = {
							...p,
							Hash,
							Id: uuid.randomUUID()
						} as SuggestionType;
						clusters[Hash] = clusters[Hash] ? [...clusters[Hash], sg] : [sg];
						return sg;
					});
					cb ? cb(suggestions as SuggestionType[]) : setState({ suggestions });
					setState({
						bound: data?.Summary?.ResultBBox,
						clusters
					});
					setViewpoint(viewpoint);
				} catch (error) {
					errorHandler(error, t("error_handler__failed_search_place_text.text") as string);
				} finally {
					setState({ isSearching: false });
				}
			},
			searchNLPlacesByText: async (value: string, viewpoint: ViewPointType, cb?: (sg: SuggestionType[]) => void) => {
				try {
					setState({ isSearching: true });
					const data = await placeService.getNLPlacesByText(value);
					const clusters: ClustersType = {};
					const suggestions = data?.Results?.map((p: SearchForTextResult) => {
						const Hash = getHash(p.Place?.Geometry?.Point as number[], store.precision);
						const sg = {
							...p,
							Hash,
							Id: uuid.randomUUID()
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
			getPlaceDataByCoordinates: async (input: number[]) => {
				try {
					return await placeService.getPlaceByCoordinates(input);
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
					const data = await placeService.getPlaceByCoordinates([parseFloat(lng), parseFloat(lat)]);

					if (!!data?.Results?.length) {
						const vPoint = data
							? { longitude: data.Summary?.Position![0] || 0, latitude: data.Summary?.Position![1] || 0 }
							: viewpoint;
						const Hash = getHash([vPoint.longitude, vPoint.latitude], 10);
						const suggestion = { ...data?.Results[0], Hash, Id: uuid.randomUUID() };
						cb ? cb([suggestion]) : setState({ suggestions: [suggestion] });
						setState({ bound: undefined });
						setViewpoint(vPoint);
					}
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
				action: string,
				isNLSearchEnabled = false
			) => {
				let placeSearchType = AnalyticsPlaceSearchTypeEnum.TEXT;
				if (isGeoString(value)) {
					await methods.searchPlacesByCoordinates(value, viewpoint, cb);
					placeSearchType = AnalyticsPlaceSearchTypeEnum.COORDINATES;
				} else if (exact && isNLSearchEnabled) {
					await methods.searchNLPlacesByText(value, viewpoint, cb);
					placeSearchType = AnalyticsPlaceSearchTypeEnum.NATURAL_LANGUAGE_TEXT;
				} else if (exact && !isNLSearchEnabled) {
					await methods.searchPlacesByText(value, viewpoint, cb);
				} else if (value?.length) {
					await methods.searchPlaceSuggestions(value, viewpoint, cb);
				}

				record([
					{
						EventType: EventTypeEnum.PLACE_SEARCH,
						Attributes: {
							exact: String(exact),
							type: placeSearchType,
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
					coords = Place?.Geometry?.Point;
				} else {
					try {
						const pd = await placeService.getPlaceById(selectedMarker.PlaceId);
						coords = pd?.Place?.Geometry?.Point;
					} catch (error) {
						errorHandler(error, t("error_handler__failed_fetch_place_id_marker.text") as string);
					}
				}

				const [longitude, latitude] = coords as number[];
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
			setIsSearching: (isSearching: boolean) => {
				setState({ isSearching });
			},
			setSuggestions: (suggestions?: SuggestionType[]) => {
				setState({ suggestions });
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
		[placeService, setState, store.precision, setInitial, setViewpoint, t]
	);
	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default usePlace;

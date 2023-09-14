/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Card, CheckboxField, Flex, Text, View } from "@aws-amplify/ui-react";
import {
	IconArrow,
	IconArrowDownUp,
	IconBicycleSolid,
	IconCar,
	IconClose,
	IconDestination,
	IconMoreVertical,
	IconMotorcycleSolid,
	IconMyLocation,
	IconPin,
	IconSearch,
	IconSegment,
	IconTruckSolid,
	IconWalking
} from "@demo/assets";

import { NotFoundCard, StepCard } from "@demo/atomicui/molecules";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import {
	useAmplifyMap,
	useAwsPlace,
	useAwsRoute,
	useBottomSheet,
	useDeviceMediaQuery,
	usePersistedData
} from "@demo/hooks";
import {
	DistanceUnitEnum,
	InputType,
	MapProviderEnum,
	MapUnitEnum,
	RouteDataType,
	RouteOptionsType,
	SuggestionType,
	TravelMode
} from "@demo/types";
import { AnalyticsEventActionsEnum, ResponsiveUIEnum, TriggeredByEnum } from "@demo/types/Enums";
import { humanReadableTime } from "@demo/utils/dateTimeUtils";
import { CalculateRouteRequest, LineString, Place, Position } from "aws-sdk/clients/location";
import { useTranslation } from "react-i18next";
import { Layer, LayerProps, LngLat, MapRef, Marker as ReactMapGlMarker, Source } from "react-map-gl";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { METRIC } = MapUnitEnum;
const { KILOMETERS, MILES } = DistanceUnitEnum;

interface RouteBoxProps {
	mapRef: MapRef | null;
	setShowRouteBox: (b: boolean) => void;
	isSideMenuExpanded: boolean;
	isDirection?: boolean;
}

const RouteBox: React.FC<RouteBoxProps> = ({ mapRef, setShowRouteBox, isSideMenuExpanded }) => {
	const [travelMode, setTravelMode] = useState<TravelMode>(TravelMode.CAR);
	const [travelModes, setTravelModes] = useState<TravelMode[]>([TravelMode.CAR]);
	const [routeDataForMobile, setRouteDataForMobile] = useState<{ [K in TravelMode]?: RouteDataType }[] | undefined>(
		undefined
	);
	const [inputFocused, setInputFocused] = useState<{ from: boolean; to: boolean }>({ from: false, to: false });
	const [value, setValue] = useState<{ from: string; to: string }>({ from: "", to: "" });
	const [suggestions, setSuggestions] = useState<{
		from: SuggestionType[] | undefined;
		to: SuggestionType[] | undefined;
	}>({ from: undefined, to: undefined });
	const [placeData, setPlaceData] = useState<{ from: Place | undefined; to: Place | undefined }>({
		from: undefined,
		to: undefined
	});
	const [isCurrentLocationSelected, setIsCurrentLocationSelected] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [stepsData, setStepsData] = useState<Place[]>([]);
	const [isCollapsed, setIsCollapsed] = useState(true);
	const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const moreOptionsRef = useRef<HTMLDivElement | null>(null);
	const arrowRef = useRef<HTMLDivElement | null>(null);
	const routesCardRef = useRef<HTMLDivElement | null>(null);
	const expandRouteRef = useRef<HTMLDivElement | null>(null);
	const {
		currentLocationData,
		viewpoint,
		mapStyle,
		mapUnit: currentMapUnit,
		isCurrentLocationDisabled,
		mapProvider: currentMapProvider
	} = useAmplifyMap();
	const { search, getPlaceData } = useAwsPlace();
	const { setUI, setBottomSheetMinHeight, setBottomSheetHeight, ui, bottomSheetHeight } = useBottomSheet();
	const {
		setRoutePositions,
		getRoute,
		setRouteData,
		resetStore: resetAwsRouteStore,
		routePositions,
		routeData,
		directions,
		setDirections
	} = useAwsRoute();
	const { defaultRouteOptions } = usePersistedData();
	const [expandRouteOptions, setExpandRouteOptions] = useState(false);
	const [moreOption, setMoreOption] = useState(false);
	const [routeOptions, setRouteOptions] = useState<RouteOptionsType>({ ...defaultRouteOptions });
	const [expandRouteOptionsMobile, setExpandRouteOptionsMobile] = useState(false);

	const { isDesktop } = useDeviceMediaQuery();
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const currentLang = i18n.language;
	const isLanguageRTL = ["ar", "he"].includes(currentLang);
	const fromInputRef = useRef<HTMLInputElement>(null);
	const toInputRef = useRef<HTMLInputElement>(null);
	const isInputFocused = inputFocused.from || inputFocused.to;
	const isBothInputFilled = value.from && value.to;

	const iconsByTravelMode = useMemo(
		() => [
			{ mode: TravelMode.CAR, IconComponent: IconCar },
			{ mode: TravelMode.WALKING, IconComponent: IconWalking },
			...(currentMapProvider === MapProviderEnum.GRAB
				? [
						{ mode: TravelMode.BICYCLE, IconComponent: IconBicycleSolid },
						{ mode: TravelMode.MOTORCYCLE, IconComponent: IconMotorcycleSolid }
				  ]
				: [{ mode: TravelMode.TRUCK, IconComponent: IconTruckSolid }])
		],
		[currentMapProvider]
	);

	const clearRoutePosition = useCallback((type: InputType) => setRoutePositions(undefined, type), [setRoutePositions]);

	const clearRouteData = useCallback(() => setRouteData(undefined), [setRouteData]);

	useEffect(() => {
		function handleClickOutside() {
			if (ui === ResponsiveUIEnum.routes) {
				fromInputRef?.current?.blur();
				toInputRef?.current?.blur();
			}
		}

		document.addEventListener("touchmove", handleClickOutside);
		return () => {
			document.removeEventListener("touchmove", handleClickOutside);
		};
	}, [ui, setBottomSheetHeight, setBottomSheetMinHeight]);

	useEffect(() => {
		if (!isDesktop) {
			if (isInputFocused) {
				setBottomSheetMinHeight(window.innerHeight - 10);
				setBottomSheetHeight(window.innerHeight);
			} else {
				if (expandRouteOptionsMobile) {
					setBottomSheetMinHeight((expandRouteRef?.current?.clientHeight || 230) + 90);
					setBottomSheetHeight((expandRouteRef?.current?.clientHeight || 230) + 100);
				} else {
					setTimeout(() => setBottomSheetMinHeight(BottomSheetHeights.routes.min), 200);
				}
			}
		}
	}, [
		bottomSheetHeight,
		isInputFocused,
		isDesktop,
		setBottomSheetHeight,
		setBottomSheetMinHeight,
		routeData,
		expandRouteOptionsMobile
	]);

	useEffect(() => {
		if (!value.from) {
			suggestions.from?.length && setSuggestions({ ...suggestions, from: undefined });
			placeData.from && setPlaceData({ ...placeData, from: undefined });
			routePositions?.from && clearRoutePosition(InputType.FROM);
			routeData && clearRouteData();
			stepsData.length && setStepsData([]);
		}

		if (!value.to) {
			suggestions.to?.length && setSuggestions({ ...suggestions, to: undefined });
			placeData.to && setPlaceData({ ...placeData, to: undefined });
			routePositions?.to && clearRoutePosition(InputType.TO);
			routeData && clearRouteData();
			stepsData.length && setStepsData([]);
			directions && setDirections(undefined);
		}

		if (
			value.from !== t("route_box__my_location.text") &&
			value.to !== t("route_box__my_location.text") &&
			isCurrentLocationSelected
		) {
			setIsCurrentLocationSelected(false);
		}
	}, [
		value,
		isCurrentLocationSelected,
		suggestions,
		placeData,
		routePositions,
		clearRoutePosition,
		routeData,
		clearRouteData,
		stepsData,
		directions,
		setDirections,
		t
	]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			const target = event.target as HTMLElement;
			!isDesktop && !!moreOption && !moreOptionsRef?.current?.contains(target) && setMoreOption(false);
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isDesktop, moreOption]);

	useEffect(() => {
		isDesktop && isCollapsed && setIsCollapsed(false);
		!isDesktop && setIsCollapsed(false);
	}, [isDesktop, isCollapsed]);

	const getDestDept = useCallback(() => {
		const obj: { DeparturePosition: Position | undefined; DestinationPosition: Position | undefined } = {
			DeparturePosition: undefined,
			DestinationPosition: undefined
		};

		if (isCurrentLocationSelected) {
			if (!placeData.from && placeData.to) {
				obj.DeparturePosition = [
					currentLocationData?.currentLocation?.longitude,
					currentLocationData?.currentLocation?.latitude
				] as Position;
				obj.DestinationPosition = [placeData.to.Geometry.Point?.[0], placeData.to.Geometry.Point?.[1]] as Position;
				return obj;
			} else if (placeData.from && !placeData.to) {
				obj.DeparturePosition = [placeData.from.Geometry.Point?.[0], placeData.from.Geometry.Point?.[1]] as Position;
				obj.DestinationPosition = [
					currentLocationData?.currentLocation?.longitude,
					currentLocationData?.currentLocation?.latitude
				] as Position;
				return obj;
			}
		} else {
			if (placeData.from && placeData.to) {
				obj.DeparturePosition = [placeData.from.Geometry.Point?.[0], placeData.from.Geometry.Point?.[1]] as Position;
				obj.DestinationPosition = [placeData.to.Geometry.Point?.[0], placeData.to.Geometry.Point?.[1]] as Position;
				return obj;
			}
		}
	}, [isCurrentLocationSelected, placeData, currentLocationData]);

	const handleParams = useCallback(
		(mode: string) => {
			const obj = getDestDept();
			let params;
			if (obj?.DeparturePosition && obj?.DestinationPosition) {
				params = {
					IncludeLegGeometry: true,
					DistanceUnit: currentMapUnit === METRIC ? KILOMETERS : MILES,
					DeparturePosition: obj.DeparturePosition,
					DestinationPosition: obj.DestinationPosition,
					TravelMode: mode,
					CarModeOptions:
						mode === TravelMode.CAR
							? {
									AvoidFerries: routeOptions.avoidFerries,
									AvoidTolls: routeOptions.avoidTolls
							  }
							: undefined,
					TruckModeOptions:
						mode === TravelMode.TRUCK
							? {
									AvoidFerries: routeOptions.avoidFerries,
									AvoidTolls: routeOptions.avoidTolls
							  }
							: undefined
				};
			}

			return params;
		},
		[currentMapUnit, getDestDept, routeOptions.avoidFerries, routeOptions.avoidTolls]
	);

	const calculateRouteData = useCallback(async () => {
		if (!!handleParams(travelMode)) {
			const rd = await getRoute(handleParams(travelMode) as CalculateRouteRequest, TriggeredByEnum.ROUTE_MODULE);
			rd && setRouteData({ ...rd, travelMode: travelMode as TravelMode });
		}
	}, [getRoute, handleParams, travelMode, setRouteData]);

	const calculateRouteDataForAllTravelModes = useCallback(async () => {
		const obj = getDestDept();

		if (obj?.DeparturePosition && obj?.DestinationPosition) {
			travelModes.map(async mode => {
				const rd = await getRoute(handleParams(mode) as CalculateRouteRequest, TriggeredByEnum.ROUTE_MODULE);
				setRouteDataForMobile(preVal => (preVal ? [...preVal, { [mode]: rd }] : [{ [mode]: rd }]));
			});
		}
	}, [getDestDept, travelModes, getRoute, handleParams]);

	useEffect(() => {
		if (!isDesktop) {
			if (currentMapProvider === MapProviderEnum.GRAB)
				setTravelModes([TravelMode.CAR, TravelMode.WALKING, TravelMode.BICYCLE, TravelMode.MOTORCYCLE]);
			else setTravelModes([TravelMode.CAR, TravelMode.WALKING, TravelMode.TRUCK]);
		}
	}, [currentMapProvider, isDesktop]);

	useEffect(() => {
		!isDesktop && calculateRouteDataForAllTravelModes();
	}, [calculateRouteDataForAllTravelModes, isDesktop, currentMapProvider]);

	useEffect(() => {
		!routeData && calculateRouteData();
	}, [routeData, calculateRouteData, mapStyle, isDesktop]);

	useEffect(() => {
		if (directions) {
			directions.info.Place?.Geometry.Point &&
				setValue({
					from:
						!currentLocationData?.error && !directions.isEsriLimitation && !isCurrentLocationDisabled
							? t("route_box__my_location.text")
							: "",
					to: directions.info.Place.Label
						? directions.info.Place.Label
						: `${directions.info.Place.Geometry.Point[1]}, ${directions.info.Place.Geometry.Point[0]}`
				});
			!currentLocationData?.error && setIsCurrentLocationSelected(true);
			setTimeout(() => {
				setPlaceData({ from: undefined, to: directions.info.Place });
				setRoutePositions(directions.info.Place?.Geometry.Point, InputType.TO);
				!currentLocationData?.error && calculateRouteData();
			}, 1000);
		}
	}, [
		directions,
		isCurrentLocationDisabled,
		viewpoint,
		currentLocationData?.error,
		setRoutePositions,
		calculateRouteData,
		t
	]);

	const onClose = () => {
		resetAwsRouteStore();
		setShowRouteBox(false);
		setUI(ResponsiveUIEnum.explore);
	};

	const handleTravelModeChange = useCallback(
		(tm: TravelMode) => {
			setTravelMode(tm);
			clearRouteData();
		},
		[clearRouteData]
	);

	const handleSearch = useCallback(
		async (value: string, exact = false, type: InputType, action: string) => {
			setIsSearching(true);

			if (value.length >= 3) {
				const { lng: longitude, lat: latitude } = mapRef?.getCenter() as LngLat;

				if (timeoutIdRef.current) {
					clearTimeout(timeoutIdRef.current);
				}

				timeoutIdRef.current = setTimeout(async () => {
					await search(
						value,
						{ longitude, latitude },
						exact,
						sg => {
							type === InputType.FROM
								? setSuggestions({ ...suggestions, from: sg })
								: setSuggestions({ ...suggestions, to: sg });
						},
						TriggeredByEnum.ROUTE_MODULE,
						action
					);
				}, 200);
			}
			setIsSearching(false);
		},
		[mapRef, search, suggestions]
	);

	useEffect(() => {
		return () => {
			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}
		};
	}, []);

	const handleClick = useCallback(
		(event: MouseEvent) => {
			const target = event.target as HTMLElement;

			if (
				arrowRef?.current?.contains(target) ||
				toInputRef?.current?.contains(target) ||
				fromInputRef?.current?.contains(target)
			) {
				return;
			}

			if (!!isBothInputFilled) {
				setInputFocused(preVal => ({ ...preVal, from: false, to: false }));
			}
		},
		[isBothInputFilled]
	);

	useEffect(() => {
		document.body.addEventListener("click", handleClick);
		return () => {
			document.body.removeEventListener("click", handleClick);
		};
	}, [handleClick]);

	const onFocus = (type: InputType) => {
		if (type === InputType.FROM) {
			setInputFocused({ from: true, to: false });
			suggestions.to?.length && setSuggestions({ ...suggestions, to: undefined });
		} else {
			setInputFocused({ from: false, to: true });
			suggestions.from?.length && setSuggestions({ ...suggestions, from: undefined });
		}
	};

	const onChangeValue = (e: ChangeEvent<HTMLInputElement>, type: InputType) => {
		if (type === InputType.FROM) {
			setValue({ ...value, from: e.target.value });
			handleSearch(e.target.value, false, InputType.FROM, AnalyticsEventActionsEnum.FROM_SEARCH_AUTOCOMPLETE);
		} else {
			setValue({ ...value, to: e.target.value });
			handleSearch(e.target.value, false, InputType.TO, AnalyticsEventActionsEnum.TO_SEARCH_AUTOCOMPLETE);
		}
	};

	const onSwap = () => {
		setValue({ from: value.to, to: value.from });
		setPlaceData({ from: placeData.to, to: placeData.from });
		setRoutePositions(placeData.to?.Geometry.Point, InputType.FROM);
		setRoutePositions(placeData.from?.Geometry.Point, InputType.TO);
		setRouteData(undefined);
	};

	const onClickRouteOptions = useCallback(() => setExpandRouteOptions(!expandRouteOptions), [expandRouteOptions]);

	const MoreOptionsUI = useCallback(
		() => (
			<View className="route-option-items">
				<CheckboxField
					className="option-item"
					label={t("avoid_tolls.text")}
					name={t("avoid_tolls.text")}
					value="Avoid tolls"
					checked={routeOptions.avoidTolls}
					onChange={e => {
						setRouteOptions({ ...routeOptions, avoidTolls: e.target.checked });
						setRouteData(undefined);
					}}
					crossOrigin={undefined}
				/>
				<CheckboxField
					className="option-item"
					label={t("avoid_ferries.text")}
					name={t("avoid_ferries.text")}
					value="Avoid ferries"
					checked={routeOptions.avoidFerries}
					onChange={e => {
						setRouteOptions({ ...routeOptions, avoidFerries: e.target.checked });
						setRouteData(undefined);
					}}
					crossOrigin={undefined}
				/>
			</View>
		),
		[routeOptions, setRouteData, t]
	);

	const renderRouteOptionsContainer = useMemo(
		() => (
			<View
				className={
					inputFocused.from || inputFocused.to || !!routeData
						? "route-options-container"
						: "route-options-container bottom-border-radius"
				}
			>
				{!expandRouteOptions ? (
					<Text className="collapsed-route-options-text" onClick={onClickRouteOptions}>
						{t("route_box__route_options.text")}
					</Text>
				) : (
					<View className="expanded-route-options">
						<Text className="text-1">{t("route_box__route_options.text")}</Text>
						<Text className="text-2" onClick={onClickRouteOptions}>
							{t("route_box__close.text")}
						</Text>
					</View>
				)}
				{expandRouteOptions && <MoreOptionsUI />}
			</View>
		),
		[inputFocused.from, inputFocused.to, routeData, expandRouteOptions, onClickRouteOptions, t, MoreOptionsUI]
	);

	const onSelectCurrentLocaiton = (type: InputType) => {
		type === InputType.FROM &&
			setValue({ ...value, from: isCurrentLocationSelected ? "" : t("route_box__my_location.text") });
		type === InputType.TO &&
			setValue({ ...value, to: isCurrentLocationSelected ? "" : t("route_box__my_location.text") });
		setIsCurrentLocationSelected(!isCurrentLocationSelected);
	};

	const onSelectSuggestion = async ({ PlaceId, Text = "", Place }: SuggestionType, type: InputType) => {
		if (!PlaceId && Text) {
			type === InputType.FROM
				? await handleSearch(Text, true, InputType.FROM, AnalyticsEventActionsEnum.FROM_SUGGESTION_SELECT)
				: await handleSearch(Text, true, InputType.TO, AnalyticsEventActionsEnum.TO_SUGGESTION_SELECT);
		} else if (!PlaceId && !Text) {
			if (type === InputType.FROM) {
				if (suggestions.from) {
					setPlaceData({ ...placeData, from: suggestions.from[0].Place });
					suggestions.from[0].Place?.Geometry.Point &&
						setRoutePositions(
							[suggestions.from[0].Place?.Geometry.Point[0], suggestions.from[0].Place?.Geometry.Point[1]],
							type
						);
				}
				setValue({ ...value, from: Place?.Label || "" });
				setSuggestions({ ...suggestions, from: undefined });
			} else {
				if (suggestions.to) {
					setPlaceData({ ...placeData, to: suggestions.to[0].Place });
					suggestions.to[0].Place?.Geometry.Point &&
						setRoutePositions(
							[suggestions.to[0].Place.Geometry.Point[0], suggestions.to[0].Place.Geometry.Point[1]],
							type
						);
				}
				setValue({ ...value, to: Place?.Label || "" });
				setSuggestions({ ...suggestions, to: undefined });
			}
			setInputFocused({ from: false, to: false });
		} else if (PlaceId) {
			const pd = await getPlaceData(PlaceId);
			if (!pd) return;

			if (type === InputType.FROM) {
				setPlaceData({ ...placeData, from: pd.Place });
				setValue({ ...value, from: pd.Place.Label || "" });
				setSuggestions({ ...suggestions, from: undefined });
			} else {
				setPlaceData({ ...placeData, to: pd.Place });
				setValue({ ...value, to: pd.Place.Label || "" });
				setSuggestions({ ...suggestions, to: undefined });
			}

			setInputFocused({ from: false, to: false });
			pd.Place.Geometry.Point &&
				setRoutePositions([pd?.Place.Geometry.Point[0] as number, pd?.Place.Geometry.Point[1] as number], type);
		}

		setTimeout(() => {
			directions && setDirections(undefined);
			stepsData.length && setStepsData([]);
			routeData && clearRouteData();
		}, 0);
	};

	const renderSuggestions = (arr: SuggestionType[], type: InputType) =>
		arr.map(({ PlaceId, Text = "", Place }, idx) => {
			const string = Text || Place?.Label || "";
			const separateIndex = !!PlaceId ? string?.indexOf(",") : -1;
			const title = separateIndex > -1 ? string?.substring(0, separateIndex) : string;
			const address = separateIndex > 1 ? string?.substring(separateIndex + 1) : null;

			return (
				<View
					data-testid={`${type}-suggestions`}
					key={`${PlaceId}-${idx}`}
					className="suggestion"
					onClick={() => onSelectSuggestion({ PlaceId, Text, Place }, type)}
				>
					{PlaceId ? <IconPin /> : <IconSearch />}
					<View className="description">
						<span className="title">{title}</span>
						<span className="address">{PlaceId && address ? address : t("search_nearby.text")}</span>
					</View>
				</View>
			);
		});

	const renderSteps = useMemo(() => {
		if (routeData) {
			return (
				<View data-testid="steps-container" className="steps-container">
					{routeData.Legs[0].Steps.map((s, idx) => (
						<StepCard
							key={idx}
							step={s}
							isFirst={idx === 0}
							isLast={idx + 1 === routeData.Legs[0].Steps.length}
							travelMode={travelMode as TravelMode}
						/>
					))}
				</View>
			);
		}
	}, [routeData, travelMode]);

	const routeFromMarker = useMemo(() => {
		if (routePositions?.from) {
			return (
				<ReactMapGlMarker longitude={routePositions.from[0]} latitude={routePositions.from[1]}>
					<IconSegment width="32px" height="32px" />
				</ReactMapGlMarker>
			);
		}
	}, [routePositions]);

	const routeToMarker = useMemo(() => {
		if (routePositions?.to) {
			return (
				<ReactMapGlMarker longitude={routePositions.to[0]} latitude={routePositions.to[1]}>
					<IconDestination width="32px" height="32px" />
				</ReactMapGlMarker>
			);
		} else if (currentLocationData?.currentLocation && value.to === t("search_nearby.text")) {
			const {
				currentLocation: { longitude, latitude }
			} = currentLocationData;
			return (
				<ReactMapGlMarker longitude={longitude} latitude={latitude}>
					<IconDestination width="32px" height="32px" />
				</ReactMapGlMarker>
			);
		}
	}, [routePositions, currentLocationData, value, t]);

	const routeLayer = useMemo(() => {
		if (routeData && routePositions) {
			const startLineJson:
				| GeoJSON.Feature<GeoJSON.Geometry>
				| GeoJSON.FeatureCollection<GeoJSON.Geometry>
				| GeoJSON.Geometry
				| string
				| undefined = {
				type: "Feature",
				properties: {},
				geometry: {
					type: "LineString",
					coordinates: [
						routePositions.from
							? routePositions.from
							: !isCurrentLocationDisabled
							? [currentLocationData?.currentLocation?.longitude, currentLocationData?.currentLocation?.latitude]
							: undefined,
						routeData.Legs[0].StartPosition
					] as LineString
				}
			};
			const endLineJson:
				| GeoJSON.Feature<GeoJSON.Geometry>
				| GeoJSON.FeatureCollection<GeoJSON.Geometry>
				| GeoJSON.Geometry
				| string
				| undefined = {
				type: "Feature",
				properties: {},
				geometry: {
					type: "LineString",
					coordinates: [
						routeData.Legs[0].EndPosition,
						routePositions.to
							? routePositions.to
							: [currentLocationData?.currentLocation?.longitude, currentLocationData?.currentLocation?.latitude]
					] as LineString
				}
			};
			const startEndLayerProps: LayerProps = {
				id: "start-end-route-layer",
				type: "line",
				layout: {
					"line-join": "round",
					"line-cap": "round"
				},
				paint: { "line-color": "#8E8E93", "line-width": 4, "line-dasharray": [0.0001, 2] }
			};
			const mainLineJson:
				| GeoJSON.Feature<GeoJSON.Geometry>
				| GeoJSON.FeatureCollection<GeoJSON.Geometry>
				| GeoJSON.Geometry
				| string
				| undefined = {
				type: "Feature",
				properties: {},
				geometry: {
					type: "LineString",
					coordinates: routeData.Legs[0].Geometry?.LineString as LineString
				}
			};
			const mapStyleLayers = mapRef?.getStyle().layers || [];
			const firstSymbolIdx = mapStyleLayers.findIndex(
				el =>
					el.type === "symbol" &&
					(el.id.startsWith("Road") || el.id.startsWith("road-shield") || el.id.startsWith("lake"))
			);
			const beforeId = firstSymbolIdx !== -1 ? mapStyleLayers[firstSymbolIdx].id : undefined;
			const mainPaint = { "line-color": "#008296", "line-width": 5, "line-opacity": 1 };
			const mainLayerProps: LayerProps = {
				id: "main-route-layer",
				type: "line",
				layout: {
					"line-join": "round",
					"line-cap": "round"
				},
				paint:
					routeData?.travelMode === TravelMode.WALKING
						? { ...mainPaint, "line-width": 4, "line-dasharray": [0.0001, 2] }
						: mainPaint,
				beforeId: beforeId
			};

			return (
				<>
					<Source type="geojson" data={startLineJson}>
						<Layer data-testid="start-route-layer" {...startEndLayerProps} id="start-route-layer" />
					</Source>
					<Source type="geojson" data={mainLineJson}>
						<Layer {...mainLayerProps} />
					</Source>
					<Source type="geojson" data={endLineJson}>
						<Layer data-testid="end-route-layer" {...startEndLayerProps} id="end-route-layer" />
					</Source>
				</>
			);
		}
	}, [routeData, routePositions, isCurrentLocationDisabled, currentLocationData, mapRef]);

	const getDuration = useCallback(
		(mode: TravelMode) => {
			const route = routeDataForMobile?.find(r => r.hasOwnProperty(mode));
			const legs = route?.[mode]?.Legs;
			const durationSeconds = legs?.[0]?.DurationSeconds;

			return durationSeconds ? humanReadableTime(durationSeconds * 1000, currentLang, t, true) : "";
		},
		[currentLang, routeDataForMobile, t]
	);

	if (expandRouteOptionsMobile)
		return (
			<Flex direction="column" gap="0" ref={expandRouteRef}>
				<Flex className="route-card-close" onClick={() => setExpandRouteOptionsMobile(false)} justifyContent="flex-end">
					<IconClose className="grey-icon expand-mobile-close" width="24px" height="24px" />
				</Flex>
				<Flex direction="column" padding="0 1.23rem">
					<Text fontFamily="AmazonEmber-Bold" fontSize="1.23rem">
						{t("route_box__route_options.text")}
					</Text>
					<MoreOptionsUI />
				</Flex>
			</Flex>
		);

	return (
		<>
			<Card
				data-testid="route-card"
				className={`route-card ${!isDesktop ? "route-card-mobile" : ""}`}
				left={!isDesktop ? 0 : isSideMenuExpanded ? 245 : 21}
				ref={routesCardRef}
			>
				<View className="route-card-close" onClick={onClose}>
					<IconClose />
				</View>
				{!isDesktop && (
					<View className="route-card-header">
						<Text className="route-card-header-text">{t("popup__directions.text")}</Text>
					</View>
				)}
				{isDesktop && (
					<Flex className="travel-mode-button-container" gap={0}>
						<View
							data-testid="travel-mode-car-icon-container"
							className={travelMode === TravelMode.CAR ? "travel-mode selected" : "travel-mode"}
							onClick={() => handleTravelModeChange(TravelMode.CAR)}
						>
							<IconCar
								data-tooltip-id="icon-car-tooltip"
								data-tooltip-place="top"
								data-tooltip-content={t("tooltip__calculate_route_car.text")}
							/>
							<Tooltip id="icon-car-tooltip" />
						</View>
						<View
							data-testid="travel-mode-walking-icon-container"
							className={travelMode === TravelMode.WALKING ? "travel-mode selected" : "travel-mode"}
							onClick={() => handleTravelModeChange(TravelMode.WALKING)}
						>
							<IconWalking
								data-tooltip-id="icon-walking-tooltip"
								data-tooltip-place="top"
								data-tooltip-content={t("tooltip__calculate_route_walk.text")}
							/>
							<Tooltip id="icon-walking-tooltip" />
						</View>

						{currentMapProvider === MapProviderEnum.GRAB ? (
							<>
								<View
									data-testid="travel-mode-bicycle-icon-container"
									className={travelMode === TravelMode.BICYCLE ? "travel-mode selected" : "travel-mode"}
									onClick={() => handleTravelModeChange(TravelMode.BICYCLE)}
								>
									<IconBicycleSolid
										data-tooltip-id="icon-bicycle-tooltip"
										data-tooltip-place="top"
										data-tooltip-content={t("tooltip__calculate_route_bicycle.text")}
									/>
									<Tooltip id="icon-bicycle-tooltip" />
								</View>
								<View
									data-testid="travel-mode-motorcycle-icon-container"
									className={travelMode === TravelMode.MOTORCYCLE ? "travel-mode selected" : "travel-mode"}
									onClick={() => handleTravelModeChange(TravelMode.MOTORCYCLE)}
								>
									<IconMotorcycleSolid
										data-tooltip-id="icon-motorcycle-tooltip"
										data-tooltip-place="top"
										data-tooltip-content={t("tooltip__calculate_route_motorcycle.text")}
									/>
									<Tooltip id="icon-motorcycle-tooltip" />
								</View>
							</>
						) : (
							<View
								data-testid="travel-mode-truck-icon-container"
								className={travelMode === TravelMode.TRUCK ? "travel-mode selected" : "travel-mode"}
								onClick={() => handleTravelModeChange(TravelMode.TRUCK)}
							>
								<IconTruckSolid
									data-tooltip-id="icon-truck-tooltip"
									data-tooltip-place="top"
									data-tooltip-content={t("tooltip__calculate_route_truck.text")}
								/>
								<Tooltip id="icon-truck-tooltip" />
							</View>
						)}
					</Flex>
				)}
				<Flex
					width="100%"
					gap="0"
					className={`from-to-container-wrapper ${!isDesktop ? "from-to-container-wrapper-mobile" : ""} ${
						!isDesktop && isBothInputFilled && !isInputFocused ? "from-to-mobile" : ""
					}`}
				>
					<Flex
						className={`from-to-container ${
							!isDesktop && isBothInputFilled && !isInputFocused ? "from-to-container-mobile" : ""
						}`}
						gap={0}
					>
						<Flex className="marker-container" order={isLtr ? 1 : 3}>
							<IconMyLocation />
							{[...Array(3)].map((_, index) => (
								<View key={index} className="dashed-line" />
							))}
							<IconDestination />
						</Flex>
						<Flex className="inputs-container" order={2}>
							<input
								ref={fromInputRef}
								data-testid="from-input"
								placeholder={t("route_box__from.text") as string}
								onFocus={() => onFocus(InputType.FROM)}
								value={value.from}
								onChange={e => onChangeValue(e, InputType.FROM)}
								dir={langDir}
							/>
							<View className="divider" />
							<input
								ref={toInputRef}
								data-testid="to-input"
								placeholder={t("route_box__to.text") as string}
								onFocus={() => onFocus(InputType.TO)}
								value={value.to}
								onChange={e => onChangeValue(e, InputType.TO)}
								dir={langDir}
							/>
						</Flex>
						{(isDesktop || (!isDesktop && !(!isInputFocused && isBothInputFilled))) && (
							<Flex
								data-testid="swap-icon-container"
								className="swap-icon-container"
								onClick={onSwap}
								order={isLtr ? 3 : 1}
								ref={arrowRef}
							>
								<IconArrowDownUp />
							</Flex>
						)}
					</Flex>
					{!isDesktop && !isInputFocused && isBothInputFilled && (
						<Flex>
							<Flex
								data-testid="swap-icon-container"
								className="swap-icon-container more-action-icon-container"
								onClick={() => setMoreOption(n => !n)}
								order={isLtr ? 3 : 1}
							>
								<IconMoreVertical className="icon-more-vertical" />
							</Flex>
							{moreOption && (
								<View
									className="more-options-container"
									onClick={() => {
										setMoreOption(false);
										setExpandRouteOptionsMobile(true);
									}}
									ref={moreOptionsRef}
								>
									More Options
								</View>
							)}
						</Flex>
					)}
				</Flex>
				{!isDesktop && (
					<Flex className="travel-mode-button-container" gap={0}>
						{iconsByTravelMode.map(({ mode, IconComponent }) => (
							<View
								key={mode}
								data-testid={`travel-mode-${mode}-icon-container`}
								className={`travel-mode ${!getDuration(mode) ? "empty-distance" : ""} ${
									travelMode === mode ? "selected" : ""
								}`}
								onClick={() => handleTravelModeChange(mode)}
							>
								<IconComponent />
								{getDuration(mode)}
							</View>
						))}
					</Flex>
				)}
				{isDesktop &&
					[TravelMode.CAR, TravelMode.TRUCK].includes(travelMode as TravelMode) &&
					!isCollapsed &&
					renderRouteOptionsContainer}
				<View
					className={`search-results-container ${!isDesktop ? "search-results-container-mobile" : ""}`}
					maxHeight={window.innerHeight - 260}
				>
					{(inputFocused.from || inputFocused.to) &&
						(!placeData.from || !placeData.to) &&
						currentLocationData?.currentLocation &&
						!isCurrentLocationSelected &&
						!isCurrentLocationDisabled && (
							<View
								className={`current-location-toggle-container ${
									!isDesktop ? "current-location-toggle-container-mobile" : ""
								}`}
								onClick={() => onSelectCurrentLocaiton(inputFocused.from ? InputType.FROM : InputType.TO)}
							>
								<IconMyLocation />
								<Text>{t("route_box__current_location.text")}</Text>
							</View>
						)}

					{!!suggestions.from?.length
						? renderSuggestions(suggestions.from, InputType.FROM)
						: !isSearching &&
						  value.from?.length > 2 &&
						  value.from !== t("route_box__my_location.text") &&
						  !placeData.from &&
						  inputFocused.from && <NotFoundCard />}
					{!!suggestions.to?.length
						? renderSuggestions(suggestions.to, InputType.TO)
						: !isSearching &&
						  value.to?.length > 2 &&
						  value.to !== t("route_box__my_location.text") &&
						  !placeData.to &&
						  inputFocused.to && <NotFoundCard />}
				</View>
				{routeData && (
					<View
						data-testid="route-data-container"
						className="route-data-container bottom-border-radius"
						maxHeight={window.innerHeight - 260}
					>
						<View className="route-info">
							{travelMode === TravelMode.CAR ? (
								<IconCar />
							) : travelMode === TravelMode.TRUCK ? (
								<IconTruckSolid />
							) : travelMode === TravelMode.WALKING ? (
								<IconWalking />
							) : travelMode === TravelMode.BICYCLE ? (
								<IconBicycleSolid />
							) : (
								<IconMotorcycleSolid />
							)}
							<View className="travel-and-distance">
								<View className="selected-travel-mode">
									<Text className="dark-text">
										{travelMode === TravelMode.CAR ||
										travelMode === TravelMode.TRUCK ||
										travelMode === TravelMode.BICYCLE ||
										travelMode === TravelMode.MOTORCYCLE
											? t("route_box__drive.text")
											: t("route_box__walk.text")}
									</Text>
									<View className="separator" />
									<Text className="grey-text">{t("route_box__selected.text")}</Text>
								</View>
								<Flex
									gap="0.3rem"
									direction={isLanguageRTL ? "row-reverse" : "row"}
									justifyContent={isLanguageRTL ? "flex-end" : "flex-start"}
								>
									<Text className="distance">{routeData.Summary.Distance.toFixed(2)}</Text>
									<Text className="distance">
										{currentMapUnit === METRIC ? t("geofence_box__km__short.text") : t("geofence_box__mi__short.text")}
									</Text>
								</Flex>
							</View>
							<View className="duration">
								<Text className="regular-text">
									{humanReadableTime(routeData.Summary.DurationSeconds * 1000, currentLang, t)}
								</Text>
							</View>
						</View>
						{!isCollapsed && renderSteps}
					</View>
				)}
				{isDesktop && routeData && (
					<View className="show-hide-details-container bottom-border-radius" onClick={() => setIsCollapsed(s => !s)}>
						<Text className="text">{isCollapsed ? t("route_box__route_details.text") : t("hide_details.text")}</Text>
						<IconArrow style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)" }} />
					</View>
				)}
			</Card>
			{routeFromMarker}
			{routeToMarker}
			{routeLayer}
		</>
	);
};

export default RouteBox;

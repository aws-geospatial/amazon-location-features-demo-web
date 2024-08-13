/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ChangeEvent, FC, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, Card, CheckboxField, Flex, Text, View } from "@aws-amplify/ui-react";
import { CalculateRouteRequest, Place } from "@aws-sdk/client-location";
import {
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
} from "@demo/assets/svgs";
import { NotFoundCard, StepCard } from "@demo/atomicui/molecules";
import { appConfig } from "@demo/core/constants";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useMap, usePersistedData, usePlace, useRoute } from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
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
import { AnalyticsEventActionsEnum, ResponsiveUIEnum, TriggeredByEnum, UserAgentEnum } from "@demo/types/Enums";
import { isUserDeviceIsAndroid } from "@demo/utils";
import { humanReadableTime } from "@demo/utils/dateTimeUtils";
import { uuid } from "@demo/utils/uuid";
import { isAndroid, isIOS } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { Layer, LayerProps, LngLat, MapRef, Marker as ReactMapGlMarker, Source } from "react-map-gl";
import { RefHandles } from "react-spring-bottom-sheet/dist/types";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

// const NotFoundCard = lazy(() =>
// 	import("@demo/atomicui/molecules/NotFoundCard").then(module => ({ default: module.NotFoundCard }))
// );
// const StepCard = lazy(() => import("@demo/atomicui/molecules/StepCard").then(module => ({ default: module.StepCard })));

const { METRIC } = MapUnitEnum;
const { KILOMETERS, MILES } = DistanceUnitEnum;
const { ANDROID } = UserAgentEnum;

const {
	ENV: { GOOGLE_PLAY_STORE_LINK }
} = appConfig;

interface RouteBoxProps {
	mapRef: MapRef | null;
	setShowRouteBox: (b: boolean) => void;
	isSideMenuExpanded: boolean;
	isDirection?: boolean;
	expandRouteOptionsMobile?: boolean;
	setExpandRouteOptionsMobile?: (b: boolean) => void;
	bottomSheetRef?: MutableRefObject<RefHandles | null>;
}

const RouteBox: FC<RouteBoxProps> = ({
	mapRef,
	setShowRouteBox,
	isSideMenuExpanded,
	expandRouteOptionsMobile,
	setExpandRouteOptionsMobile,
	bottomSheetRef
}) => {
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
	const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
	} = useMap();
	const { search, getPlaceData } = usePlace();
	const {
		setUI,
		setBottomSheetMinHeight,
		setBottomSheetHeight,
		ui,
		bottomSheetHeight,
		bottomSheetCurrentHeight = 0
	} = useBottomSheet();
	const {
		setRoutePositions,
		getRoute,
		setRouteData,
		resetStore: resetRouteStore,
		routePositions,
		routeData,
		directions,
		setDirections
	} = useRoute();
	const { defaultRouteOptions } = usePersistedData();
	const [expandRouteOptions, setExpandRouteOptions] = useState(false);
	const [routeOptions, setRouteOptions] = useState<RouteOptionsType>({ ...defaultRouteOptions });
	const { isDesktop, isDesktopBrowser } = useDeviceMediaQuery();
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

	const clearRouteData = useCallback(() => {
		setRouteData(undefined);
		setRouteDataForMobile(undefined);
	}, [setRouteData]);

	useEffect(() => {
		function handleClickOutside() {
			if (ui === ResponsiveUIEnum.routes) {
				fromInputRef?.current?.blur();
				toInputRef?.current?.blur();
				setInputFocused({ from: false, to: false });
			}
		}

		document.addEventListener("touchmove", handleClickOutside);
		return () => {
			document.removeEventListener("touchmove", handleClickOutside);
		};
	}, [ui]);

	useEffect(() => {
		if (!isDesktop && !isInputFocused) {
			if (expandRouteOptionsMobile) {
				setBottomSheetMinHeight((expandRouteRef?.current?.clientHeight || 230) + 90);
				setBottomSheetHeight((expandRouteRef?.current?.clientHeight || 230) + 100);
			} else {
				setTimeout(() => setBottomSheetMinHeight(BottomSheetHeights.routes.min), 200);
			}
		}
	}, [
		bottomSheetHeight,
		isInputFocused,
		isDesktop,
		setBottomSheetHeight,
		setBottomSheetMinHeight,
		routeData,
		expandRouteOptionsMobile,
		bottomSheetCurrentHeight
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

	const getDestDept = useCallback(() => {
		const obj: { DeparturePosition: number[] | undefined; DestinationPosition: number[] | undefined } = {
			DeparturePosition: undefined,
			DestinationPosition: undefined
		};

		if (isCurrentLocationSelected) {
			if (!placeData.from && placeData.to) {
				obj.DeparturePosition = [
					currentLocationData?.currentLocation?.longitude,
					currentLocationData?.currentLocation?.latitude
				] as number[];
				obj.DestinationPosition = [placeData.to.Geometry?.Point?.[0], placeData.to.Geometry?.Point?.[1]] as number[];
				return obj;
			} else if (placeData.from && !placeData.to) {
				obj.DeparturePosition = [placeData.from.Geometry?.Point?.[0], placeData.from.Geometry?.Point?.[1]] as number[];
				obj.DestinationPosition = [
					currentLocationData?.currentLocation?.longitude,
					currentLocationData?.currentLocation?.latitude
				] as number[];
				return obj;
			}
		} else {
			if (placeData.from && placeData.to) {
				obj.DeparturePosition = [placeData.from.Geometry?.Point?.[0], placeData.from.Geometry?.Point?.[1]] as number[];
				obj.DestinationPosition = [placeData.to.Geometry?.Point?.[0], placeData.to.Geometry?.Point?.[1]] as number[];
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

	const calculateRouteDataForAllTravelModes = useCallback(async () => {
		const obj = getDestDept();

		if (obj?.DeparturePosition && obj?.DestinationPosition) {
			travelModes.map(async mode => {
				if (!!handleParams(mode)) {
					const rd = await getRoute(handleParams(mode) as CalculateRouteRequest, TriggeredByEnum.ROUTE_MODULE);
					rd && setRouteDataForMobile(preVal => (preVal ? [...preVal, { [mode]: rd }] : [{ [mode]: rd }]));
				}
			});
		}
	}, [getDestDept, travelModes, getRoute, handleParams]);

	const calculateRouteData = useCallback(async () => {
		if (!!handleParams(travelMode)) {
			const rd = await getRoute(handleParams(travelMode) as CalculateRouteRequest, TriggeredByEnum.ROUTE_MODULE);
			rd && setRouteData({ ...rd, travelMode: travelMode as TravelMode });
			!isDesktop && !routeDataForMobile && calculateRouteDataForAllTravelModes();
		}
	}, [
		getRoute,
		handleParams,
		travelMode,
		setRouteData,
		isDesktop,
		routeDataForMobile,
		calculateRouteDataForAllTravelModes
	]);

	useEffect(() => {
		if (!isDesktop) {
			fromInputRef.current?.focus();
		}
	}, [isDesktop]);

	useEffect(() => {
		if (!isDesktop) {
			if (currentMapProvider === MapProviderEnum.GRAB)
				setTravelModes([TravelMode.CAR, TravelMode.WALKING, TravelMode.BICYCLE, TravelMode.MOTORCYCLE]);
			else setTravelModes([TravelMode.CAR, TravelMode.WALKING, TravelMode.TRUCK]);
		}
	}, [currentMapProvider, isDesktop]);

	useEffect(() => {
		!routeData && calculateRouteData();
	}, [routeData, calculateRouteData, mapStyle, isDesktop]);

	useEffect(() => {
		if (directions) {
			directions.info.Place?.Geometry?.Point &&
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
				setRoutePositions(directions.info.Place?.Geometry?.Point, InputType.TO);
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
		resetRouteStore();
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

	const onFocus = useCallback(
		(type: InputType) => {
			if (type === InputType.FROM) {
				setInputFocused({ from: true, to: false });
				suggestions.to?.length && setSuggestions({ ...suggestions, to: undefined });
			} else {
				setInputFocused({ from: false, to: true });
				suggestions.from?.length && setSuggestions({ ...suggestions, from: undefined });
			}

			if ((isAndroid || isIOS) && !isDesktopBrowser) {
				if (bottomSheetCurrentHeight < window.innerHeight * 0.9) {
					setBottomSheetHeight(window.innerHeight);
					setTimeout(() => {
						bottomSheetRef?.current?.snapTo(window.innerHeight);
					}, 0);
				}
			} else {
				if (bottomSheetCurrentHeight < window.innerHeight * 0.4) {
					setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
					setBottomSheetHeight(window.innerHeight * 0.4);

					setTimeout(() => {
						setBottomSheetMinHeight(BottomSheetHeights.explore.min);
						setBottomSheetHeight(window.innerHeight);
					}, 200);
				}
			}
		},
		[
			bottomSheetCurrentHeight,
			bottomSheetRef,
			isDesktopBrowser,
			setBottomSheetHeight,
			setBottomSheetMinHeight,
			suggestions
		]
	);

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
		setRoutePositions(placeData.to?.Geometry?.Point, InputType.FROM);
		setRoutePositions(placeData.from?.Geometry?.Point, InputType.TO);
		setRouteData(undefined);
		setRouteDataForMobile(undefined);
	};

	const handleBlur = useCallback(() => {
		if ((isAndroid || isIOS) && !isDesktopBrowser && !isDesktop) {
			setTimeout(() => {
				if (
					!fromInputRef.current?.contains(document.activeElement) &&
					!toInputRef.current?.contains(document.activeElement) &&
					(value.from.length || fromInputRef.current?.value === t("route_box__my_location.text")) &&
					(value.to.length || toInputRef.current?.value === t("route_box__my_location.text"))
				) {
					setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
					setBottomSheetHeight(window.innerHeight * 0.4);
				} else {
					if (bottomSheetCurrentHeight < window.innerHeight * 0.9) {
						setBottomSheetMinHeight(window.innerHeight - 10);
						setBottomSheetHeight(window.innerHeight);
					}
				}
			}, 200);
		}
	}, [
		bottomSheetCurrentHeight,
		isDesktop,
		isDesktopBrowser,
		setBottomSheetHeight,
		setBottomSheetMinHeight,
		t,
		value.from.length,
		value.to.length
	]);

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
						setRouteDataForMobile(undefined);
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
						setRouteDataForMobile(undefined);
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

	const onSelectCurrentLocation = (type: InputType) => {
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
					suggestions.from[0].Place?.Geometry?.Point &&
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
					suggestions.to[0].Place?.Geometry?.Point &&
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
				setValue({ ...value, from: pd.Place?.Label || "" });
				setSuggestions({ ...suggestions, from: undefined });
			} else {
				setPlaceData({ ...placeData, to: pd.Place });
				setValue({ ...value, to: pd.Place?.Label || "" });
				setSuggestions({ ...suggestions, to: undefined });
			}

			setInputFocused({ from: false, to: false });
			pd.Place?.Geometry?.Point &&
				setRoutePositions([pd?.Place?.Geometry?.Point[0] as number, pd.Place?.Geometry.Point[1] as number], type);
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
					onClick={() => {
						onSelectSuggestion({ Id: uuid.randomUUID(), PlaceId, Text, Place }, type);
					}}
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
				<View data-testid="steps-container" className={`steps-container ${!isDesktop ? "steps-container-mobile" : ""}`}>
					{routeData.Legs![0].Steps?.map((s, idx) => (
						<StepCard
							key={idx}
							step={s}
							isFirst={idx === 0}
							isLast={idx + 1 === routeData.Legs![0].Steps?.length}
							travelMode={travelMode as TravelMode}
						/>
					))}
				</View>
			);
		}
	}, [routeData, travelMode, isDesktop]);

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
						routeData.Legs![0].StartPosition
					] as number[][]
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
						routeData.Legs![0].EndPosition,
						routePositions.to
							? routePositions.to
							: [currentLocationData?.currentLocation?.longitude, currentLocationData?.currentLocation?.latitude]
					] as number[][]
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
					coordinates: routeData.Legs![0].Geometry?.LineString as number[][]
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

			return durationSeconds ? humanReadableTime(durationSeconds * 1000, currentLang, t, !isDesktop) : "";
		},
		[currentLang, routeDataForMobile, t, isDesktop]
	);

	const renderTravelModes = useMemo(() => {
		return (
			<Flex gap="0">
				{iconsByTravelMode.map(({ mode, IconComponent }) => {
					const duration = getDuration(mode);

					return (
						<Flex
							key={mode}
							data-testid={`travel-mode-${mode}-icon-container`}
							className={`travel-mode ${travelMode === mode ? "selected" : ""} ${!duration ? "no-duration" : ""}`}
							onClick={() => {
								if (duration) {
									const rd = routeDataForMobile?.find(r => r.hasOwnProperty(mode))![mode];
									setTravelMode(mode);
									setRouteData({ Legs: rd!.Legs, Summary: rd!.Summary, travelMode: mode });
								}
							}}
						>
							<IconComponent />
							{duration ? <Text className="regular small-text duration-text">{duration}</Text> : null}
						</Flex>
					);
				})}
			</Flex>
		);
	}, [getDuration, iconsByTravelMode, routeDataForMobile, setRouteData, travelMode]);

	if (expandRouteOptionsMobile) {
		return (
			<>
				<Flex direction="column" gap="0" ref={expandRouteRef}>
					<Flex direction="column" padding="0 1.23rem">
						<Text fontFamily="AmazonEmber-Bold" fontSize="1.23rem">
							{t("route_box__route_options.text")}
						</Text>
						<MoreOptionsUI />
					</Flex>
				</Flex>
				{routeFromMarker}
				{routeToMarker}
				{routeLayer}
			</>
		);
	} else {
		return (
			<>
				<Card
					data-testid="route-card"
					className={`route-card ${!isDesktop ? "route-card-mobile" : ""}`}
					left={!isDesktop ? 0 : isSideMenuExpanded ? 245 : 21}
					ref={routesCardRef}
				>
					{isDesktop && (
						<View className="route-card-close" onClick={onClose}>
							<IconClose />
						</View>
					)}
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
								<Flex className="icon-my-location" />
								{[...Array(3)].map((_, index) => (
									<View key={index} className="dashed-line" />
								))}
								<Flex className="icon-destination" />
							</Flex>
							<Flex className="inputs-container" order={2}>
								<input
									ref={fromInputRef}
									data-testid="from-input"
									placeholder={t("route_box__from.text") as string}
									onFocus={() => onFocus(InputType.FROM)}
									onBlur={handleBlur}
									value={value.from}
									onChange={e => onChangeValue(e, InputType.FROM)}
									dir={langDir}
									type="text"
									autoComplete="from-input"
								/>
								<View className="divider" />
								<input
									ref={toInputRef}
									data-testid="to-input"
									placeholder={t("route_box__to.text") as string}
									onFocus={() => onFocus(InputType.TO)}
									onBlur={handleBlur}
									value={value.to}
									onChange={e => onChangeValue(e, InputType.TO)}
									dir={langDir}
								/>
							</Flex>
							<Flex
								data-testid="swap-icon-container"
								className="swap-icon-container"
								onClick={onSwap}
								order={isLtr ? 3 : 1}
								ref={arrowRef}
							>
								<IconArrowDownUp />
							</Flex>
						</Flex>
					</Flex>
					{!isDesktop && (
						<Flex className="travel-mode-button-container">
							{!isInputFocused && isBothInputFilled && (
								<Flex
									data-testid="more-action-icon-container"
									className="swap-icon-container more-action-icon-container"
									onClick={() => {
										setExpandRouteOptionsMobile && setExpandRouteOptionsMobile(true);
									}}
								>
									<IconMoreVertical className="icon-more-vertical" />
								</Flex>
							)}
							{renderTravelModes}
						</Flex>
					)}
					{isDesktop &&
						[TravelMode.CAR, TravelMode.TRUCK].includes(travelMode as TravelMode) &&
						renderRouteOptionsContainer}
					<View
						className={`search-results-container ${!isDesktop ? "search-results-container-mobile" : ""}`}
						maxHeight={!isDesktop ? bottomSheetCurrentHeight - 230 : window.innerHeight - 260}
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
									onClick={() => onSelectCurrentLocation(inputFocused.from ? InputType.FROM : InputType.TO)}
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
							className={`route-data-container ${isDesktop ? "bottom-border-radius" : ""}`}
							maxHeight={!isDesktop ? bottomSheetCurrentHeight - 230 : "100%"}
						>
							{isDesktop ? (
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
											<Text className="distance">{routeData.Summary?.Distance?.toFixed(2)}</Text>
											<Text className="distance">
												{currentMapUnit === METRIC
													? t("geofence_box__km__short.text")
													: t("geofence_box__mi__short.text")}
											</Text>
										</Flex>
									</View>
									<View className="duration">
										<Text className="regular-text">
											{humanReadableTime(routeData.Summary!.DurationSeconds! * 1000, currentLang, t, !isDesktop)}
										</Text>
									</View>
								</View>
							) : (
								<Flex className={"route-info-mobile  border-bottom"}>
									<Flex className="time-and-distance">
										<Text className="bold small-text">
											{humanReadableTime(routeData.Summary!.DurationSeconds! * 1000, currentLang, t, !isDesktop)}
										</Text>
										<Flex gap={0}>
											<Text className="regular small-text">{routeData.Summary!.Distance!.toFixed(2)}</Text>
											<Text className="regular small-text">
												&nbsp;
												{currentMapUnit === METRIC
													? t("geofence_box__km__short.text")
													: t("geofence_box__mi__short.text")}
											</Text>
										</Flex>
									</Flex>
									<Flex grow={1} />
									{isUserDeviceIsAndroid() === ANDROID && (
										<Button
											variation="primary"
											className="go-button bold"
											onClick={() => window.open(GOOGLE_PLAY_STORE_LINK, "_blank")}
										>
											{t("go.text")}
										</Button>
									)}
								</Flex>
							)}
							{renderSteps}
						</View>
					)}
				</Card>
				{routeFromMarker}
				{routeToMarker}
				{routeLayer}
			</>
		);
	}
};

export default RouteBox;

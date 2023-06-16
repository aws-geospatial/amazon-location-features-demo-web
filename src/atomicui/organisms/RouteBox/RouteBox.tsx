/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Card, CheckboxField, Flex, Text, View } from "@aws-amplify/ui-react";
import {
	IconArrow,
	IconArrowDownUp,
	IconBicycleSolid,
	IconCar,
	IconClose,
	IconDestination,
	IconMotorcycleSolid,
	IconMyLocation,
	IconPin,
	IconSearch,
	IconSegment,
	IconTruckSolid,
	IconWalking
} from "@demo/assets";

import { NotFoundCard, StepCard } from "@demo/atomicui/molecules";
import { useAmplifyMap, useAwsPlace, useAwsRoute, useMediaQuery, usePersistedData } from "@demo/hooks";
import {
	DistanceUnitEnum,
	InputType,
	MapProviderEnum,
	MapUnitEnum,
	RouteOptionsType,
	SuggestionType,
	TravelMode
} from "@demo/types";

import { humanReadableTime } from "@demo/utils/dateTimeUtils";
import { CalculateRouteRequest, LineString, Place, Position } from "aws-sdk/clients/location";
import { Layer, LayerProps, LngLat, MapRef, Marker as ReactMapGlMarker, Source } from "react-map-gl";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { METRIC } = MapUnitEnum;
const { KILOMETERS, KILOMETERS_SHORT, MILES, MILES_SHORT } = DistanceUnitEnum;

interface RouteBoxProps {
	mapRef: MapRef | null;
	setShowRouteBox: (b: boolean) => void;
	isSideMenuExpanded: boolean;
}

const RouteBox: React.FC<RouteBoxProps> = ({ mapRef, setShowRouteBox, isSideMenuExpanded }) => {
	const [travelMode, setTravelMode] = useState<string>(TravelMode.CAR);
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
	const {
		currentLocationData,
		viewpoint,
		mapStyle,
		mapUnit: currentMapUnit,
		isCurrentLocationDisabled,
		mapProvider: currentMapProvider
	} = useAmplifyMap();
	const { search, getPlaceData } = useAwsPlace();
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
	const [routeOptions, setRouteOptions] = useState<RouteOptionsType>({ ...defaultRouteOptions });
	const isDesktop = useMediaQuery("(min-width: 1024px)");

	const clearRoutePosition = useCallback((type: InputType) => setRoutePositions(undefined, type), [setRoutePositions]);

	const clearRouteData = useCallback(() => setRouteData(undefined), [setRouteData]);

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

		if (value.from !== "My Location" && value.to !== "My Location" && isCurrentLocationSelected) {
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
		setDirections
	]);

	useEffect(() => {
		isDesktop && isCollapsed && setIsCollapsed(false);
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

	const calculateRouteData = useCallback(async () => {
		const obj = getDestDept();

		if (obj?.DeparturePosition && obj?.DestinationPosition) {
			const params: Omit<CalculateRouteRequest, "CalculatorName" | "DepartNow"> = {
				IncludeLegGeometry: true,
				DistanceUnit: currentMapUnit === METRIC ? KILOMETERS : MILES,
				DeparturePosition: obj.DeparturePosition,
				DestinationPosition: obj.DestinationPosition,
				TravelMode: travelMode,
				CarModeOptions:
					travelMode === TravelMode.CAR
						? {
								AvoidFerries: routeOptions.avoidFerries,
								AvoidTolls: routeOptions.avoidTolls
						  }
						: undefined,
				TruckModeOptions:
					travelMode === TravelMode.TRUCK
						? {
								AvoidFerries: routeOptions.avoidFerries,
								AvoidTolls: routeOptions.avoidTolls
						  }
						: undefined
			};
			const rd = await getRoute(params as CalculateRouteRequest);
			rd && setRouteData({ ...rd, travelMode: travelMode as TravelMode });
		}
	}, [getDestDept, currentMapUnit, travelMode, routeOptions, getRoute, setRouteData]);

	useEffect(() => {
		!routeData && calculateRouteData();
	}, [routeData, calculateRouteData, mapStyle]);

	useEffect(() => {
		if (directions) {
			directions.info.Place?.Geometry.Point &&
				setValue({
					from:
						!currentLocationData?.error && !directions.isEsriLimitation && !isCurrentLocationDisabled
							? "My Location"
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
		calculateRouteData
	]);

	const onClose = () => {
		resetAwsRouteStore();
		setShowRouteBox(false);
	};

	const handleTravelModeChange = (travelMode: TravelMode) => {
		setTravelMode(travelMode);
		setRouteData(undefined);
	};

	const handleSearch = useCallback(
		async (value: string, exact = false, type: InputType) => {
			setIsSearching(true);

			if (value.length >= 3) {
				const { lng: longitude, lat: latitude } = mapRef?.getCenter() as LngLat;

				await search(value, { longitude, latitude }, exact, sg => {
					type === InputType.FROM
						? setSuggestions({ ...suggestions, from: sg })
						: setSuggestions({ ...suggestions, to: sg });
				});
			}
			setIsSearching(false);
		},
		[mapRef, search, suggestions]
	);

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
			handleSearch(e.target.value, false, InputType.FROM);
		} else {
			setValue({ ...value, to: e.target.value });
			handleSearch(e.target.value, false, InputType.TO);
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
						Route Options
					</Text>
				) : (
					<View className="expanded-route-options">
						<Text className="text-1">Route Options</Text>
						<Text className="text-2" onClick={onClickRouteOptions}>
							Close
						</Text>
					</View>
				)}
				{expandRouteOptions && (
					<View className="route-option-items">
						<CheckboxField
							className="option-item"
							label="Avoid tolls"
							name="Avoid tolls"
							value="Avoid tolls"
							checked={routeOptions.avoidTolls}
							onChange={e => {
								setRouteOptions({ ...routeOptions, avoidTolls: e.target.checked });
								setRouteData(undefined);
							}}
						/>
						<CheckboxField
							className="option-item"
							label="Avoid ferries"
							name="Avoid ferries"
							value="Avoid ferries"
							checked={routeOptions.avoidFerries}
							onChange={e => {
								setRouteOptions({ ...routeOptions, avoidFerries: e.target.checked });
								setRouteData(undefined);
							}}
						/>
					</View>
				)}
			</View>
		),
		[inputFocused, routeData, expandRouteOptions, onClickRouteOptions, routeOptions, setRouteData]
	);

	const onSelectCurrentLocaiton = (type: InputType) => {
		type === InputType.FROM && setValue({ ...value, from: isCurrentLocationSelected ? "" : "My Location" });
		type === InputType.TO && setValue({ ...value, to: isCurrentLocationSelected ? "" : "My Location" });
		setIsCurrentLocationSelected(!isCurrentLocationSelected);
	};

	const onSelectSuggestion = async ({ PlaceId, Text = "", Place }: SuggestionType, type: InputType) => {
		if (!PlaceId && Text) {
			type === InputType.FROM
				? await handleSearch(Text, true, InputType.FROM)
				: await handleSearch(Text, true, InputType.TO);
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
						<span className="address">{PlaceId && address ? address : "Search nearby"}</span>
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
		} else if (currentLocationData?.currentLocation && value.to === "My Location") {
			const {
				currentLocation: { longitude, latitude }
			} = currentLocationData;
			return (
				<ReactMapGlMarker longitude={longitude} latitude={latitude}>
					<IconDestination width="32px" height="32px" />
				</ReactMapGlMarker>
			);
		}
	}, [routePositions, currentLocationData, value]);

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

	return (
		<>
			<Card data-testid="route-card" className="route-card" left={isSideMenuExpanded ? 245 : 21}>
				<View className="route-card-close" onClick={onClose}>
					<IconClose />
				</View>
				<Flex className="travel-mode-button-container" gap={0}>
					<View
						data-testid="travel-mode-car-icon-container"
						className={travelMode === TravelMode.CAR ? "travel-mode selected" : "travel-mode"}
						onClick={() => handleTravelModeChange(TravelMode.CAR)}
					>
						<IconCar
							data-tooltip-id="icon-car-tooltip"
							data-tooltip-place="top"
							data-tooltip-content={'Calculate route with "Car" as travel mode'}
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
							data-tooltip-content={'Calculate route with "Walking" as travel mode'}
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
									data-tooltip-content={'Calculate route with "Bicycle" as travel mode'}
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
									data-tooltip-content={'Calculate route with "Motorcycle" as travel mode'}
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
								data-tooltip-content={'Calculate route with "Truck" as travel mode'}
							/>
							<Tooltip id="icon-truck-tooltip" />
						</View>
					)}
				</Flex>
				<Flex className="from-to-container" gap={0}>
					<Flex className="marker-container">
						<IconMyLocation />
						{[...Array(3)].map((_, index) => (
							<View key={index} className="dashed-line" />
						))}
						<IconDestination />
					</Flex>
					<Flex className="inputs-container">
						<input
							data-testid="from-input"
							placeholder="From"
							onFocus={() => onFocus(InputType.FROM)}
							value={value.from}
							onChange={e => onChangeValue(e, InputType.FROM)}
						/>
						<View className="divider" />
						<input
							data-testid="to-input"
							placeholder="To"
							onFocus={() => onFocus(InputType.TO)}
							value={value.to}
							onChange={e => onChangeValue(e, InputType.TO)}
						/>
					</Flex>
					<Flex data-testid="swap-icon-container" className="swap-icon-container" onClick={onSwap}>
						<IconArrowDownUp />
					</Flex>
				</Flex>
				{[TravelMode.CAR, TravelMode.TRUCK].includes(travelMode as TravelMode) &&
					!isCollapsed &&
					renderRouteOptionsContainer}
				<View className="search-results-container" maxHeight={window.innerHeight - 260}>
					{(inputFocused.from || inputFocused.to) &&
						(!placeData.from || !placeData.to) &&
						currentLocationData?.currentLocation &&
						!isCurrentLocationSelected &&
						!isCurrentLocationDisabled && (
							<View
								className="current-location-toggle-container"
								onClick={() => onSelectCurrentLocaiton(inputFocused.from ? InputType.FROM : InputType.TO)}
							>
								<IconMyLocation />
								<Text>Current location</Text>
							</View>
						)}

					{!!suggestions.from?.length
						? renderSuggestions(suggestions.from, InputType.FROM)
						: !isSearching &&
						  value.from?.length > 2 &&
						  value.from !== "My Location" &&
						  !placeData.from &&
						  inputFocused.from && <NotFoundCard />}
					{!!suggestions.to?.length
						? renderSuggestions(suggestions.to, InputType.TO)
						: !isSearching &&
						  value.to?.length > 2 &&
						  value.to !== "My Location" &&
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
											? "Drive"
											: "Walk"}
									</Text>
									<View className="separator" />
									<Text className="grey-text">Selected</Text>
								</View>
								<Text className="grey-text">{`${routeData.Summary.Distance.toFixed(2)} ${
									currentMapUnit === METRIC ? KILOMETERS_SHORT : MILES_SHORT
								}`}</Text>
							</View>
							<View className="duration">
								<Text className="regular-text">{humanReadableTime(routeData.Summary.DurationSeconds * 1000)}</Text>
							</View>
						</View>
						{!isCollapsed && renderSteps}
					</View>
				)}
				{routeData && (
					<View className="show-hide-details-container bottom-border-radius" onClick={() => setIsCollapsed(s => !s)}>
						<Text className="text">{isCollapsed ? "Route details" : "Hide details"}</Text>
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

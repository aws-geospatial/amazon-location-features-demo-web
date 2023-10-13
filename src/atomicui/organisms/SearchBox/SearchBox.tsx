/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Autocomplete, Badge, ComboBoxOption, Flex, Placeholder, SwitchField, Text, View } from "@aws-amplify/ui-react";
import { IconActionMenu, IconClose, IconDirections, IconPin, IconSearch } from "@demo/assets";
import { Marker, NotFoundCard, SuggestionMarker } from "@demo/atomicui/molecules";
import { useAmplifyMap, useAwsPlace } from "@demo/hooks";
import { DistanceUnitEnum, MapUnitEnum, SuggestionType } from "@demo/types";
import { AnalyticsEventActionsEnum, TriggeredByEnum } from "@demo/types/Enums";
import { calculateGeodesicDistance } from "@demo/utils/geoCalculation";
import { uuid } from "@demo/utils/uuid";
import { Units } from "@turf/turf";
import { Location } from "aws-sdk";
import { LngLat } from "mapbox-gl";
import { useTranslation } from "react-i18next";
import { MapRef } from "react-map-gl";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { METRIC } = MapUnitEnum;
const { KILOMETERS, MILES } = DistanceUnitEnum;

interface SearchBoxProps {
	mapRef: MapRef | null;
	isSideMenuExpanded: boolean;
	onToggleSideMenu: () => void;
	setShowRouteBox: (b: boolean) => void;
	isRouteBoxOpen: boolean;
	isAuthGeofenceBoxOpen: boolean;
	isAuthTrackerBoxOpen: boolean;
	isSettingsOpen: boolean;
	isStylesCardOpen: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
	mapRef,
	isSideMenuExpanded,
	onToggleSideMenu,
	setShowRouteBox,
	isRouteBoxOpen,
	isAuthGeofenceBoxOpen,
	isAuthTrackerBoxOpen,
	isSettingsOpen,
	isStylesCardOpen
}) => {
	const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [value, setValue] = useState<string>("");
	const [isFocused, setIsFocused] = useState(false);
	const [isNLChecked, setIsNLChecked] = React.useState(false);
	const autocompleteRef = useRef<HTMLInputElement | null>(null);
	const { mapUnit: currentMapUnit, isCurrentLocationDisabled, currentLocationData, viewpoint } = useAmplifyMap();
	const {
		clusters,
		suggestions,
		selectedMarker,
		marker,
		search,
		isSearching,
		clearPoiList,
		setSelectedMarker,
		setHoveredMarker,
		setIsSearching
	} = useAwsPlace();
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const currentLang = i18n.language;
	const isLanguageRTL = ["ar", "he"].includes(currentLang);

	useEffect(() => {
		if (!value) {
			clearPoiList();
		}

		if (isRouteBoxOpen || isAuthGeofenceBoxOpen || isAuthTrackerBoxOpen || isSettingsOpen || isStylesCardOpen) {
			setValue("");
			clearPoiList();
		}
	}, [
		value,
		clearPoiList,
		isRouteBoxOpen,
		isAuthGeofenceBoxOpen,
		isAuthTrackerBoxOpen,
		isSettingsOpen,
		isStylesCardOpen
	]);

	const handleSearch = useCallback(
		async (value: string, exact = false, action: string) => {
			const { lng: longitude, lat: latitude } = mapRef?.getCenter() as LngLat;
			const vp = { longitude, latitude };

			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}

			setIsSearching(true);
			timeoutIdRef.current = setTimeout(async () => {
				await search(
					value,
					{ longitude: vp.longitude, latitude: vp.latitude },
					exact,
					undefined,
					TriggeredByEnum.PLACES_SEARCH,
					action
				);
				setIsSearching(false);
			}, 200);
		},
		[mapRef, setIsSearching, search]
	);

	useEffect(() => {
		return () => {
			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}
		};
	}, []);

	const selectSuggestion = async ({ text, label, placeid }: ComboBoxOption) => {
		if (!placeid) {
			await handleSearch(text || label, true, AnalyticsEventActionsEnum.SUGGESTION_SELECTED);
		} else {
			const selectedMarker = suggestions?.find(
				(i: SuggestionType) => i.PlaceId === placeid || i.Place?.Label === placeid
			);

			await setSelectedMarker(selectedMarker);
		}
	};

	const setHover = useCallback(
		({ placeid }: ComboBoxOption) => {
			if (!placeid) return;

			const selectedMarker = suggestions?.find(
				(i: SuggestionType) => i.PlaceId === placeid || i.Place?.Label === placeid
			);
			setHoveredMarker(selectedMarker);
		},
		[setHoveredMarker, suggestions]
	);

	const onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
		clearPoiList();
		setValue(value);
		handleSearch(value, false, AnalyticsEventActionsEnum.AUTOCOMPLETE);
	};

	const onSearch = () => {
		if (!!value) {
			clearPoiList();
			handleSearch(value, false, AnalyticsEventActionsEnum.SEARCH_ICON_CLICK);
			autocompleteRef?.current?.focus();
		}
	};

	const onNLPChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
		clearPoiList();
		setValue(value);
	};

	const renderOption = (option: {
		id: string;
		placeid?: string;
		label: string;
		country?: string;
		region?: string;
		geometry?: string;
	}) => {
		const { id, placeid, label, country, region, geometry } = option;
		const separateIndex = id !== "" ? label.indexOf(",") : -1;
		const title = separateIndex > -1 ? label.substring(0, separateIndex) : label;
		const address = separateIndex > 1 ? label.substring(separateIndex + 1).trim() : null;
		const _geometry = geometry ? (JSON.parse(geometry) as Location.PlaceGeometry) : undefined;
		const destCoords = _geometry?.Point ? _geometry?.Point : undefined;
		const geodesicDistance = destCoords
			? calculateGeodesicDistance(
					isCurrentLocationDisabled
						? [viewpoint.longitude, viewpoint.latitude]
						: currentLocationData?.currentLocation
						? [
								currentLocationData.currentLocation.longitude as number,
								currentLocationData.currentLocation.latitude as number
						  ]
						: [viewpoint.longitude, viewpoint.latitude],
					[destCoords[0], destCoords[1]],
					currentMapUnit === METRIC ? (KILOMETERS.toLowerCase() as Units) : (MILES.toLowerCase() as Units)
			  )
			: undefined;
		const localizeGeodesicDistance = () => {
			const formatter = new Intl.NumberFormat(currentLang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
			return formatter.format(geodesicDistance || 0);
		};

		const geodesicDistanceUnit = geodesicDistance
			? currentMapUnit === METRIC
				? t("geofence_box__km__short.text")
				: t("geofence_box__mi__short.text")
			: undefined;

		return (
			<Flex data-testid={`suggestion-${id}`} key={id} className="option-container" onMouseOver={() => setHover(option)}>
				{!placeid ? <IconSearch /> : <IconPin />}
				<View className="option-details">
					<Text>{title}</Text>
					{geodesicDistanceUnit ? (
						<Flex gap={0} alignItems="center">
							<Flex gap="0.3rem" direction={isLanguageRTL ? "row-reverse" : "row"}>
								<Text variation="tertiary">{localizeGeodesicDistance()}</Text>
								<Text variation="tertiary">{geodesicDistanceUnit}</Text>
							</Flex>
							<View className="separator" />
							<Text variation="tertiary">{`${region}, ${country}`}</Text>
						</Flex>
					) : (
						<Text variation="tertiary">{placeid && address ? address : t("search_nearby.text")}</Text>
					)}
				</View>
			</Flex>
		);
	};

	const options = useMemo(
		() =>
			suggestions?.map(({ PlaceId, Text, Place }: SuggestionType) => {
				return {
					id: uuid.randomUUID(),
					placeid: PlaceId || Place?.Label || "",
					label: Text || Place?.Label || "",
					country: Place?.Country || "",
					region: Place?.Region || "",
					geometry: Place?.Geometry ? JSON.stringify(Place.Geometry) : ""
				};
			}),
		[suggestions]
	);

	const onClearSearch = () => {
		setValue("");
		clearPoiList();
	};

	const markers = useMemo(() => {
		if (suggestions?.length === 1 && selectedMarker) {
			return suggestions.map(s => (
				<SuggestionMarker key={s.Hash} active={true} searchValue={value} setSearchValue={setValue} {...s} />
			));
		} else if (!clusters) {
			return suggestions?.map((s, i) => {
				return s.PlaceId ? (
					<SuggestionMarker
						key={`${s.PlaceId}_${i}`}
						active={s.PlaceId === selectedMarker?.PlaceId}
						searchValue={value}
						setSearchValue={setValue}
						{...s}
					/>
				) : null;
			});
		} else {
			return Object.keys(clusters).reduce((acc, key) => {
				const cluster = clusters[key];
				const containsSelectedPoi = selectedMarker?.Hash?.includes(key);
				const s = containsSelectedPoi ? cluster.find(i => i.Hash === selectedMarker?.Hash) || cluster[0] : cluster[0];

				acc.push(
					<SuggestionMarker
						key={`${s.Hash}_${key}`}
						active={s.Place?.Label === selectedMarker?.Place?.Label}
						searchValue={value}
						setSearchValue={setValue}
						{...s}
					/>
				);
				return acc;
			}, [] as Array<JSX.Element>);
		}
	}, [suggestions, selectedMarker, clusters, value]);

	const mapMarker = useMemo(
		() => marker && <Marker searchValue={value} setSearchValue={setValue} {...marker} />,
		[value, marker]
	);

	const hideBorderRadius = useMemo(() => {
		return (
			((!!document.getElementsByClassName("amplify-autocomplete__menu").length && !!value) ||
				!!suggestions?.length ||
				isSearching) &&
			isFocused
		);
	}, [value, suggestions?.length, isFocused, isSearching]);

	return (
		<>
			<Flex
				data-testid="search-bar-container"
				className="search-bar"
				style={{
					flexDirection: "column",
					left: isSideMenuExpanded ? 252 : 20,
					borderBottomLeftRadius: hideBorderRadius ? "0px" : "8px",
					borderBottomRightRadius: hideBorderRadius ? "0px" : "8px",
					maxWidth: isNLChecked ? "500px" : "360px"
				}}
			>
				<Flex gap={0} width="100%" height="100%" alignItems="center">
					<Autocomplete
						id="search-bar"
						className={!value && !suggestions?.length ? "search-complete noEmpty" : "search-complete"}
						ref={autocompleteRef}
						inputMode="search"
						hasSearchIcon={false}
						label={t("search.text")}
						dir={langDir}
						innerStartComponent={
							<Flex data-testid="hamburger-menu" className="inner-start-component" onClick={onToggleSideMenu}>
								<IconActionMenu />
							</Flex>
						}
						size="large"
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						onSubmit={e => handleSearch(e, true, AnalyticsEventActionsEnum.ENTER_BUTTON)}
						value={value}
						onChange={!isNLChecked ? onChange : onNLPChange}
						onClear={clearPoiList}
						placeholder={t("search.text") as string}
						options={options || []}
						results={options?.length || 0}
						renderOption={renderOption}
						optionFilter={() => true}
						onSelect={selectSuggestion}
						menuSlots={{
							LoadingIndicator: (
								<Flex className="search-loader-container">
									{Array.from({ length: 5 }).map((_, index) => (
										<Flex className="skeleton-container" key={index}>
											<Placeholder />
											<Placeholder width="65%" />
										</Flex>
									))}
								</Flex>
							),
							Empty: !isNLChecked ? (
								!!value && !suggestions?.length ? (
									<Flex className="not-found-container">
										<NotFoundCard />
									</Flex>
								) : null
							) : (
								<Flex
									gap={0}
									className="inner-search-component"
									style={{
										flexDirection: "column",
										gap: "0"
									}}
								>
									<Flex>
										<h3>Try Asking:</h3>
									</Flex>
									<Flex
										style={{
											flexDirection: "column",
											gap: "0.1px",
											marginBottom: "20px",
											fontStyle: "italic",
											fontSize: "15px"
										}}
									>
										<q>What are some places to get coffee in Boston?</q>
										<q>Where can I get a haircut?</q>
										<q>Find me some dinner spots around Vancouver?</q>
									</Flex>
									<Flex
										style={{
											marginLeft: "60px"
										}}
									>
										Search Powered by Amazon Bedrock
										<Badge size="small" variation="warning">
											Prototype
										</Badge>
									</Flex>
								</Flex>
							)
						}}
						isLoading={isSearching}
						innerEndComponent={
							<Flex className="inner-end-components">
								<Flex className="icon inner-end-component" onClick={onSearch}>
									<IconSearch
										data-tooltip-id="search-button"
										data-tooltip-place="bottom"
										data-tooltip-content={t("search.text")}
									/>
									<Tooltip id="search-button" />
								</Flex>
								<Flex
									className="icon outter-end-component"
									onClick={!!value ? onClearSearch : () => setShowRouteBox(true)}
								>
									{!!value ? (
										<IconClose data-testid="clean-search" />
									) : (
										<>
											<IconDirections
												data-tooltip-id="directions-button"
												data-tooltip-place="bottom"
												data-tooltip-content={t("routes.text")}
												data-testid="directions-button"
											/>
											<Tooltip id="directions-button" />
										</>
									)}
								</Flex>
							</Flex>
						}
						outerStartComponent={
							<Flex
								className="nl-search-container"
								style={{
									flexDirection: "column",
									left: isSideMenuExpanded ? 0 : 0,
									top: "44px",
									borderBottomLeftRadius: hideBorderRadius ? "0px" : "8px",
									borderBottomRightRadius: hideBorderRadius ? "0px" : "8px",
									gap: "0.1px",
									padding: "0.5em",
									height: isNLChecked && !value ? "185px" : "40px",
									flex: 1
								}}
							>
								<Flex
									gap={0}
									width="100%"
									height="100%"
									alignItems="center"
									style={{
										borderBottom: isNLChecked && !value ? "1px solid var(--grey-color-3)" : "",
										marginLeft: "10px"
									}}
								>
									<SwitchField
										label="Enable AI search powered by AWS Bedrock"
										labelPosition="end"
										size="small"
										isChecked={isNLChecked}
										onChange={e => setIsNLChecked(e.target.checked)}
									/>
									<Badge size="small" variation="warning">
										Prototype
									</Badge>
								</Flex>
								{isNLChecked && !value ? (
									<Flex
										gap={0}
										width="100%"
										height="100%"
										alignItems="start"
										className="inner-search-component"
										marginLeft="10px"
										marginBottom="0.2em"
										style={{
											flexDirection: "column",
											gap: "0"
										}}
									>
										<h5>Try Asking:</h5>
										<Flex
											style={{
												flexDirection: "column",
												gap: "0.1px",
												marginBottom: "12px",
												fontStyle: "italic",
												fontSize: "12px"
											}}
										>
											<q>What are some places to get coffee in Boston?</q>
											<q>Where can I get a haircut?</q>
											<q>Find me some dinner spots around Vancouver?</q>
										</Flex>
									</Flex>
								) : (
									<></>
								)}
							</Flex>
						}
						crossOrigin={undefined}
					/>
				</Flex>
			</Flex>
			{markers}
			{mapMarker}
		</>
	);
};

export default SearchBox;

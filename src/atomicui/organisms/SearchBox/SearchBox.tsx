/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Autocomplete, Button, ComboBoxOption, Flex, Placeholder, Text, View } from "@aws-amplify/ui-react";
import { IconActionMenu, IconClose, IconDirections, IconPin, IconSearch } from "@demo/assets";
import { InputField, Marker, NotFoundCard, SuggestionMarker } from "@demo/atomicui/molecules";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useAmplifyMap, useAwsPlace } from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { DistanceUnitEnum, MapUnitEnum, SuggestionType } from "@demo/types";
import { AnalyticsEventActionsEnum, ResponsiveUIEnum, TriggeredByEnum } from "@demo/types/Enums";
import { calculateGeodesicDistance } from "@demo/utils/geoCalculation";
import { uuid } from "@demo/utils/uuid";
import { Units } from "@turf/turf";
import { Location } from "aws-sdk";
import { LngLat } from "mapbox-gl";
import { isAndroid, isIOS } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { MapRef } from "react-map-gl";
import { RefHandles } from "react-spring-bottom-sheet/dist/types";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { METRIC } = MapUnitEnum;
const { KILOMETERS, MILES } = DistanceUnitEnum;

interface SearchBoxProps {
	mapRef: MapRef | null;
	value: string;
	setValue: (value: string) => void;
	isSideMenuExpanded: boolean;
	onToggleSideMenu: () => void;
	setShowRouteBox: (b: boolean) => void;
	isRouteBoxOpen: boolean;
	isAuthGeofenceBoxOpen: boolean;
	isAuthTrackerBoxOpen: boolean;
	isSettingsOpen: boolean;
	isStylesCardOpen: boolean;
	isSimpleSearch?: boolean;
	bottomSheetRef?: React.MutableRefObject<RefHandles | null>;
}

const SearchBox: React.FC<SearchBoxProps> = ({
	mapRef,
	value,
	setValue,
	isSideMenuExpanded,
	onToggleSideMenu,
	setShowRouteBox,
	isRouteBoxOpen,
	isAuthGeofenceBoxOpen,
	isAuthTrackerBoxOpen,
	isSettingsOpen,
	isStylesCardOpen,
	isSimpleSearch = false,
	bottomSheetRef
}) => {
	const [isFocused, setIsFocused] = useState(false);
	const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
		setSearchingState,
		setIsSearching
	} = useAwsPlace();
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const currentLang = i18n.language;
	const isLanguageRTL = ["ar", "he"].includes(currentLang);
	const {
		bottomSheetCurrentHeight = 0,
		setBottomSheetMinHeight,
		setBottomSheetHeight,
		POICard,
		setUI,
		ui
	} = useBottomSheet();
	const { isDesktop, isDesktopBrowser } = useDeviceMediaQuery();
	const searchContainerRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isDesktop) {
			if (isFocused && !!value?.length) setUI(ResponsiveUIEnum.search);
			else if (ui === ResponsiveUIEnum.search && !value?.length) setUI(ResponsiveUIEnum.explore);
		}
	}, [setUI, isFocused, value, isDesktop, ui]);

	useEffect(() => {
		if (isRouteBoxOpen || isAuthGeofenceBoxOpen || isAuthTrackerBoxOpen || isSettingsOpen || isStylesCardOpen) {
			setValue("");
			clearPoiList();
		}
	}, [
		value,
		setValue,
		clearPoiList,
		isRouteBoxOpen,
		isAuthGeofenceBoxOpen,
		isAuthTrackerBoxOpen,
		isSettingsOpen,
		isStylesCardOpen
	]);

	useEffect(() => {
		if (!isDesktop) {
			function handleClickOutside() {
				if (ui === ResponsiveUIEnum.explore) {
					setIsFocused(false);
					searchInputRef.current?.blur();
				}
			}

			document.addEventListener("touchmove", handleClickOutside);
			return () => {
				document.removeEventListener("touchmove", handleClickOutside);
			};
		}
	}, [ui, setBottomSheetHeight, isDesktop, bottomSheetRef]);

	const handleSearch = useCallback(
		async (value: string, exact = false, action: string) => {
			setSearchingState(!!value?.length);
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
		[mapRef, search, setSearchingState, setIsSearching]
	);

	useEffect(() => {
		return () => {
			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}
		};
	}, []);

	const selectSuggestion = useCallback(
		async ({ text, label, placeid }: ComboBoxOption) => {
			if (!placeid) {
				await handleSearch(text || label, true, AnalyticsEventActionsEnum.SUGGESTION_SELECTED);
				setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
				setBottomSheetHeight(window.innerHeight * 0.4);

				setTimeout(() => {
					setBottomSheetMinHeight(BottomSheetHeights.explore.min);
					setBottomSheetHeight(window.innerHeight);
				}, 500);
			} else {
				const selectedMarker = suggestions?.find(
					(i: SuggestionType) => i.PlaceId === placeid || i.Place?.Label === placeid
				);

				await setSelectedMarker(selectedMarker);
			}
		},
		[handleSearch, setBottomSheetHeight, setBottomSheetMinHeight, setSelectedMarker, suggestions]
	);

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
		}
		autocompleteRef?.current?.focus();
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
		isSimpleSearch && setUI && setUI(ResponsiveUIEnum.explore);
	};

	const markers = useMemo(() => {
		if (suggestions?.length === 1 && selectedMarker) {
			return suggestions.map((s, i) => (
				<SuggestionMarker key={i} active={true} searchValue={value} setSearchValue={setValue} {...s} />
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
	}, [suggestions, selectedMarker, clusters, value, setValue]);

	const mapMarker = useMemo(
		() => marker && <Marker searchValue={value} setSearchValue={setValue} {...marker} />,
		[marker, value, setValue]
	);

	const hideBorderRadius = useMemo(() => {
		return (
			((!!document.getElementsByClassName("amplify-autocomplete__menu").length && !!value) ||
				!!suggestions?.length ||
				isSearching) &&
			isFocused
		);
	}, [value, suggestions?.length, isFocused, isSearching]);

	const simpleSearchOnFocus = (e: { stopPropagation: () => void }) => {
		e.stopPropagation();
		setIsFocused(true);
		if ((isAndroid || isIOS) && !isDesktopBrowser) {
			bottomSheetRef?.current?.snapTo(1000);
		} else {
			if (bottomSheetCurrentHeight < document.documentElement.clientHeight * 0.4) {
				setBottomSheetMinHeight(document.documentElement.clientHeight * 0.4 - 10);
				setBottomSheetHeight(document.documentElement.clientHeight * 0.4);

				setTimeout(() => {
					setBottomSheetMinHeight(BottomSheetHeights.explore.min);
					setBottomSheetHeight(document.documentElement.clientHeight);
				}, 200);
			}
		}
	};

	const onFormSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			handleSearch(value, true, AnalyticsEventActionsEnum.ENTER_BUTTON);
			if (!!options?.length) {
				setTimeout(() => {
					setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
					setBottomSheetHeight(window.innerHeight * 0.4);
				}, 200);
				searchInputRef?.current?.blur();
			}
		},
		[handleSearch, options, setBottomSheetHeight, setBottomSheetMinHeight, value]
	);

	return (
		<>
			{ui !== ResponsiveUIEnum.poi_card && !POICard ? (
				<>
					{isSimpleSearch ? (
						<Flex direction="column" gap="0" className="simple-search-bar" ref={searchContainerRef}>
							<form onSubmit={onFormSubmit}>
								<Flex gap="0" padding="0 0.61rem 0.61rem">
									<InputField
										dataTestId="search-box-input"
										searchInputRef={searchInputRef}
										value={value}
										onChange={onChange}
										dir={langDir}
										onKeyDown={e => {
											e.stopPropagation();
										}}
										onFocus={simpleSearchOnFocus}
										onBlur={e => {
											e.stopPropagation();
											if ((isAndroid || isIOS) && !isDesktopBrowser) {
												setBottomSheetMinHeight(document.documentElement.clientHeight * 0.4 - 10);
												setBottomSheetHeight(document.documentElement.clientHeight * 0.4);

												setTimeout(() => {
													setBottomSheetMinHeight(BottomSheetHeights.explore.min);
													setBottomSheetHeight(document.documentElement.clientHeight);
												}, 200);
											}
											setIsFocused(false);
											!value?.length && setUI(ResponsiveUIEnum.explore);
										}}
										placeholder={t("search.text") as string}
										innerStartComponent={
											<Flex
												className="icon inner-end-component"
												onClick={onSearch}
												alignItems="center"
												margin="0 0.3rem 0 0.8rem"
											>
												<IconSearch data-tooltip-content={t("search.text")} width="1.53rem" />
											</Flex>
										}
										innerEndComponent={
											<Flex className="inner-end-components">
												{!!value && (
													<Flex className="icon outter-end-component" onClick={onClearSearch}>
														<IconClose />
													</Flex>
												)}
											</Flex>
										}
									/>
									{!!value && (
										<Button className="clear-button" onClick={onClearSearch}>
											{t("confirmation_modal__cancel.text")}
										</Button>
									)}
								</Flex>
							</form>
							<Flex gap="0" direction="column">
								{isSearching ? (
									<Flex className="search-loader-container">
										{Array.from({ length: 5 }).map((_, index) => (
											<Flex className="skeleton-container" key={index}>
												<Placeholder />
												<Placeholder width="65%" />
											</Flex>
										))}
									</Flex>
								) : !isSearching && !!value && !suggestions?.length ? (
									<Flex className="not-found-container">
										<NotFoundCard />
									</Flex>
								) : (
									<Flex
										gap="0"
										direction="column"
										className={`search-complete ${!isDesktop ? "search-complete-mobile" : ""}`}
										maxHeight={bottomSheetCurrentHeight}
										paddingBottom={!!options?.length ? "5.1rem" : ""}
									>
										{!!options?.length &&
											options.map((option, i) => (
												<div
													key={i}
													onClick={() => {
														selectSuggestion({
															id: option.id,
															text: !!option?.placeid ? value : option.label,
															label: option.label,
															placeid: option?.placeid
														});
													}}
													className="option-wrapper"
												>
													{renderOption(option)}
												</div>
											))}
									</Flex>
								)}
							</Flex>
						</Flex>
					) : (
						<Flex
							data-testid="search-bar-container"
							className="search-bar"
							style={{
								flexDirection: "column",
								left: isSideMenuExpanded ? 252 : 20,
								borderBottomLeftRadius: hideBorderRadius ? "0px" : "8px",
								borderBottomRightRadius: hideBorderRadius ? "0px" : "8px"
							}}
						>
							<Flex gap={0} width="100%" height="100%" alignItems="center">
								<Autocomplete
									data-testid="search-box-input"
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
									onChange={onChange}
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
										Empty:
											!!value && !suggestions?.length ? (
												<Flex className="not-found-container">
													<NotFoundCard />
												</Flex>
											) : null
									}}
									isLoading={isSearching}
									innerEndComponent={
										<Flex className="inner-end-components">
											<>
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
														<IconClose />
													) : (
														<>
															<IconDirections
																data-tooltip-id="directions-button"
																data-tooltip-place="bottom"
																data-tooltip-content={t("routes.text")}
															/>
															<Tooltip id="directions-button" />
														</>
													)}
												</Flex>
											</>
										</Flex>
									}
									crossOrigin={undefined}
								/>
							</Flex>
						</Flex>
					)}
				</>
			) : (
				POICard
			)}
			{markers}
			{mapMarker}
		</>
	);
};

export default SearchBox;

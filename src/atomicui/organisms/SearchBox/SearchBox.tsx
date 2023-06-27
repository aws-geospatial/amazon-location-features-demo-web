/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Autocomplete, ComboBoxOption, Flex, Loader, View } from "@aws-amplify/ui-react";
import { IconActionMenu, IconClose, IconDirections, IconPin, IconSearch } from "@demo/assets";
import { TextEl } from "@demo/atomicui/atoms";
import { Marker, NotFoundCard, SuggestionMarker } from "@demo/atomicui/molecules";
import { useAmplifyMap, useAwsPlace } from "@demo/hooks";
import { DistanceUnitEnum, MapUnitEnum, SuggestionType } from "@demo/types";
import { calculateGeodesicDistance } from "@demo/utils/geoCalculation";
import { uuid } from "@demo/utils/uuid";
import { Units } from "@turf/turf";
import { Location } from "aws-sdk";
import { LngLat } from "mapbox-gl";
import { MapRef } from "react-map-gl";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { METRIC } = MapUnitEnum;
const { KILOMETERS, KILOMETERS_SHORT, MILES, MILES_SHORT } = DistanceUnitEnum;

interface SearchBoxProps {
	mapRef: MapRef | null;
	isSideMenuExpanded: boolean;
	onToggleSideMenu: () => void;
	setShowRouteBox: (b: boolean) => void;
	isRouteBoxOpen: boolean;
	isGeofenceBoxOpen: boolean;
	isTrackingBoxOpen: boolean;
	isSettingsOpen: boolean;
	isStylesCardOpen: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
	mapRef,
	isSideMenuExpanded,
	onToggleSideMenu,
	setShowRouteBox,
	isRouteBoxOpen,
	isGeofenceBoxOpen,
	isTrackingBoxOpen,
	isSettingsOpen,
	isStylesCardOpen
}) => {
	const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [value, setValue] = useState<string>("");
	const [isFocused, setIsFocused] = useState(false);
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
		setHoveredMarker
	} = useAwsPlace();

	useEffect(() => {
		if (!value) {
			clearPoiList();
		}

		if (isRouteBoxOpen || isGeofenceBoxOpen || isTrackingBoxOpen || isSettingsOpen || isStylesCardOpen) {
			setValue("");
			clearPoiList();
		}
	}, [value, clearPoiList, isRouteBoxOpen, isGeofenceBoxOpen, isTrackingBoxOpen, isSettingsOpen, isStylesCardOpen]);

	const handleSearch = useCallback(
		async (value: string, exact = false) => {
			const { lng: longitude, lat: latitude } = mapRef?.getCenter() as LngLat;
			const vp = { longitude, latitude };

			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}

			timeoutIdRef.current = setTimeout(async () => {
				await search(value, { longitude: vp.longitude, latitude: vp.latitude }, exact);
			}, 200);
		},
		[mapRef, search]
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
			await handleSearch(text || label, true);
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
		handleSearch(value);
	};

	const onSearch = () => {
		if (!!value) {
			clearPoiList();
			handleSearch(value);
			autocompleteRef?.current?.focus();
		}
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
		const geodesicDistanceWithUnit = geodesicDistance
			? currentMapUnit === METRIC
				? `${geodesicDistance.toFixed(2)} ${KILOMETERS_SHORT}`
				: `${geodesicDistance.toFixed(2)} ${MILES_SHORT}`
			: undefined;

		return (
			<Flex key={id} className="option-container" onMouseOver={() => setHover(option)}>
				{!placeid ? <IconSearch /> : <IconPin />}
				<View className="option-details">
					<TextEl text={title} />
					{geodesicDistanceWithUnit ? (
						<Flex gap={0} alignItems="center">
							<TextEl variation="tertiary" text={geodesicDistanceWithUnit} />
							<View className="separator" />
							<TextEl variation="tertiary" text={`${region}, ${country}`} />
						</Flex>
					) : (
						<TextEl variation="tertiary" text={placeid && address ? address : "Search nearby"} />
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
			!!document.getElementsByClassName("amplify-autocomplete__menu").length &&
			!!value &&
			!!suggestions?.length &&
			isFocused
		);
	}, [value, suggestions, isFocused]);

	return (
		<>
			<Flex
				data-testid="search-bar-container"
				className="search-bar"
				style={{
					flexDirection: "column",
					left: isSideMenuExpanded ? 245 : 20,
					borderBottomLeftRadius: hideBorderRadius ? "0px" : "8px",
					borderBottomRightRadius: hideBorderRadius ? "0px" : "8px"
				}}
			>
				<Flex gap={0} width="100%" height="100%" alignItems="center">
					<Autocomplete
						className="search-complete"
						ref={autocompleteRef}
						inputMode="search"
						hasSearchIcon={false}
						label="Search"
						innerStartComponent={
							<Flex className="inner-start-component" onClick={onToggleSideMenu}>
								<IconActionMenu />
							</Flex>
						}
						size="large"
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						onSubmit={e => handleSearch(e, true)}
						value={value}
						onChange={onChange}
						onClear={clearPoiList}
						placeholder="Search"
						options={options || []}
						results={options?.length || 0}
						renderOption={renderOption}
						optionFilter={() => true}
						onSelect={selectSuggestion}
						innerEndComponent={
							<Flex className="inner-end-components">
								<Flex className="icon inner-end-component" onClick={onSearch}>
									<IconSearch
										data-tooltip-id="search-button"
										data-tooltip-place="bottom"
										data-tooltip-content="Search"
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
												data-tooltip-content="Routes"
											/>
											<Tooltip id="directions-button" />
										</>
									)}
								</Flex>
							</Flex>
						}
					/>
				</Flex>
				{isSearching ? (
					<Flex className="search-loader-container">
						<Loader />
						<TextEl margin="15px 0px 30px 0px" text="Searching for suggestions..." />
					</Flex>
				) : !!value && !suggestions?.length ? (
					<NotFoundCard />
				) : null}
			</Flex>
			{markers}
			{mapMarker}
		</>
	);
};

export default SearchBox;

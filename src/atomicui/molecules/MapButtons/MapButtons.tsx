/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Card, CheckboxField, Divider, Flex, Link, Placeholder, SearchField, Text } from "@aws-amplify/ui-react";
import { IconClose, IconFilterFunnel, IconGeofencePlusSolid, IconMapSolid, IconRadar, IconSearch } from "@demo/assets";
import { NotFoundCard } from "@demo/atomicui/molecules";
import { appConfig } from "@demo/core/constants";
import { useAmplifyAuth, useAmplifyMap, useAwsGeofence } from "@demo/hooks";
import {
	AttributeEnum,
	EsriMapEnum,
	GrabMapEnum,
	HereMapEnum,
	MapProviderEnum,
	MapStyle,
	MapStyleFilterTypes,
	TypeEnum
} from "@demo/types";
import { EventTypeEnum, OpenDataMapEnum, TriggeredByEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { GRAB } = MapProviderEnum;
const {
	MAP_RESOURCES: {
		MAP_STYLES: { ESRI_STYLES, HERE_STYLES, GRAB_STYLES, OPEN_DATA_STYLES }
	}
} = appConfig;

const MAP_STYLES = [...ESRI_STYLES, ...HERE_STYLES, ...GRAB_STYLES, ...OPEN_DATA_STYLES] as MapStyle[];

const filters = {
	Providers: Object.values(MapProviderEnum).map(value => value),
	Attribute: Object.values(AttributeEnum).map(value => value),
	Type: Object.values(TypeEnum).map(value => value)
};

export interface MapButtonsProps {
	renderedUpon: string;
	openStylesCard: boolean;
	setOpenStylesCard: (b: boolean) => void;
	onCloseSidebar: () => void;
	onOpenConnectAwsAccountModal: () => void;
	onOpenSignInModal: () => void;
	onShowGeofenceBox: () => void;
	isGrabVisible: boolean;
	showGrabDisclaimerModal: boolean;
	onShowGridLoader: () => void;
	handleMapStyleChange: (id: EsriMapEnum | HereMapEnum | GrabMapEnum | OpenDataMapEnum) => void;
	searchValue: string;
	setSearchValue: (s: string) => void;
	selectedFilters: MapStyleFilterTypes;
	setSelectedFilters: React.Dispatch<React.SetStateAction<MapStyleFilterTypes>>;
	isLoading?: boolean;
	onlyMapStyles?: boolean;
	resetSearchAndFilters?: () => void;
	showOpenDataDisclaimerModal: boolean;
	isAuthTrackerDisclaimerModalOpen: boolean;
	onShowAuthTrackerDisclaimerModal: () => void;
	isAuthTrackerBoxOpen: boolean;
}

const MapButtons: React.FC<MapButtonsProps> = ({
	renderedUpon,
	openStylesCard,
	setOpenStylesCard,
	onCloseSidebar,
	onOpenConnectAwsAccountModal,
	onOpenSignInModal,
	onShowGeofenceBox,
	isGrabVisible,
	showGrabDisclaimerModal,
	onShowGridLoader,
	handleMapStyleChange,
	searchValue = "",
	setSearchValue,
	selectedFilters = {
		Providers: [],
		Attribute: [],
		Type: []
	},
	setSelectedFilters,
	isLoading = false,
	onlyMapStyles = false,
	resetSearchAndFilters,
	showOpenDataDisclaimerModal,
	isAuthTrackerDisclaimerModalOpen,
	onShowAuthTrackerDisclaimerModal,
	isAuthTrackerBoxOpen
}) => {
	const [isLoadingImg, setIsLoadingImg] = useState(true);
	const [showFilter, setShowFilter] = useState(false);
	const stylesCardRef = useRef<HTMLDivElement | null>(null);
	const stylesCardTogglerRef = useRef<HTMLDivElement | null>(null);
	const { credentials, isUserAwsAccountConnected } = useAmplifyAuth();
	const { mapStyle: currentMapStyle } = useAmplifyMap();
	const { isAddingGeofence, setIsAddingGeofence } = useAwsGeofence();
	const isAuthenticated = !!credentials?.authenticated;
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";

	const handleClickOutside = useCallback(
		(ev: MouseEvent) => {
			if (
				stylesCardRef.current &&
				!stylesCardRef.current.contains(ev.target as Node) &&
				stylesCardTogglerRef.current &&
				!stylesCardTogglerRef.current.contains(ev.target as Node) &&
				!showGrabDisclaimerModal &&
				!showOpenDataDisclaimerModal
			) {
				setOpenStylesCard(false);
				resetSearchAndFilters && resetSearchAndFilters();
				setShowFilter(false);
			}
		},
		[showGrabDisclaimerModal, showOpenDataDisclaimerModal, setOpenStylesCard, resetSearchAndFilters]
	);

	useEffect(() => {
		window.addEventListener("mousedown", handleClickOutside);

		return () => {
			window.removeEventListener("mousedown", handleClickOutside);
		};
	}, [handleClickOutside]);

	const toggleMapStyles = () => {
		setIsLoadingImg(true);
		setOpenStylesCard(!openStylesCard);
		setSearchValue("");
		resetSearchAndFilters && resetSearchAndFilters();
		setShowFilter(false);
	};

	const onConnectAwsAccount = () => {
		onCloseSidebar();
		onOpenConnectAwsAccountModal();
	};

	const onPrompt = () => {
		if (isUserAwsAccountConnected) {
			onCloseSidebar();
			!isAuthenticated && onOpenSignInModal();
		} else {
			onConnectAwsAccount();
		}
	};

	const onClickGeofence = () => {
		if (isAuthenticated) {
			onCloseSidebar();
			onShowGeofenceBox();
			setIsAddingGeofence(!isAddingGeofence);
			record(
				[
					{
						EventType: EventTypeEnum.GEOFENCE_CREATION_STARTED,
						Attributes: { triggeredBy: TriggeredByEnum.MAP_BUTTONS }
					}
				],
				["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
			);
		} else {
			onPrompt();
		}
	};

	const onClickTracker = () => {
		if (isAuthenticated) {
			onCloseSidebar();
			onShowAuthTrackerDisclaimerModal();
		} else {
			onPrompt();
		}
	};

	const resetFilters = useCallback(() => {
		setSelectedFilters({
			Providers: [],
			Attribute: [],
			Type: []
		});
	}, [setSelectedFilters]);

	const onChangeStyle = useCallback(
		(id: EsriMapEnum | HereMapEnum | GrabMapEnum | OpenDataMapEnum) => {
			if (id !== currentMapStyle) {
				onShowGridLoader();
				handleMapStyleChange(id);
			}

			let mapProvider = "Unknown";

			if (Object.values(EsriMapEnum).includes(id as EsriMapEnum)) {
				mapProvider = MapProviderEnum.ESRI;
			} else if (Object.values(HereMapEnum).includes(id as HereMapEnum)) {
				mapProvider = MapProviderEnum.HERE;
			} else if (Object.values(GrabMapEnum).includes(id as GrabMapEnum)) {
				mapProvider = MapProviderEnum.GRAB;
			} else if (Object.values(OpenDataMapEnum).includes(id as OpenDataMapEnum)) {
				mapProvider = MapProviderEnum.OPEN_DATA;
			}

			record([
				{
					EventType: EventTypeEnum.MAP_STYLE_CHANGE,
					Attributes: { id, provider: String(mapProvider), triggeredBy: renderedUpon }
				}
			]);
		},
		[currentMapStyle, handleMapStyleChange, onShowGridLoader, renderedUpon]
	);

	const addProviderTitle = useCallback(
		(styles: MapStyle[], isGrabVisible: boolean): (MapStyle | { title: string })[] => {
			return styles.reduce((acc: (MapStyle | { title: string })[], style: MapStyle) => {
				const { filters } = style;
				const provider = filters?.provider === GRAB ? `${GRAB}Maps` : filters?.provider;

				if (!(provider === `${GRAB}Maps` && !isGrabVisible)) {
					if (!acc.some(item => "title" in item && item.title === provider)) {
						acc.push({ title: provider });
					}
					acc.push(style);
				}

				return acc;
			}, []);
		},
		[]
	);

	const noFilters = !(
		!selectedFilters.Providers.length &&
		!selectedFilters.Attribute.length &&
		!selectedFilters.Type.length
	);

	/**
	 * Filters and groups map styles based on the provided keyword and selected filters.
	 *
	 * @param {Array<MapStyle | { title: string }>} styles - The array of map styles to filter.
	 * @param {string} keyword - The keyword to filter map styles by.
	 * @param {SelectedFilters} selectedFilters - The selected filters to apply.
	 * @returns {Array<MapStyle | { title: string }>} - The filtered and grouped map styles.
	 */
	const searchStyles = (
		styles: Array<MapStyle | { title: string }>,
		keyword: string,
		selectedFilters: MapStyleFilterTypes
	): Array<MapStyle | { title: string }> => {
		const lowerCaseKeyword = keyword.toLowerCase();

		// Check if there is no keyword and no filters are selected
		const noKeywordAndFilters =
			lowerCaseKeyword === "" &&
			selectedFilters.Providers.length === 0 &&
			selectedFilters.Attribute.length === 0 &&
			selectedFilters.Type.length === 0;

		// Return the original styles array if there is no keyword and no filters are selected
		if (noKeywordAndFilters) return styles;

		// Group styles by provider
		const groupedStyles = styles.reduce((acc: { [key: string]: Array<MapStyle | { title: string }> }, item) => {
			const providerKey = "title" in item ? (item.title === `${GRAB}Maps` ? GRAB : item.title) : item.filters.provider;
			acc[providerKey] = acc[providerKey] || [];
			if (!("title" in item)) acc[providerKey].push(item);
			return acc;
		}, {});

		// Filter styles within each group and flatten the result
		return Object.entries(groupedStyles).flatMap(([provider, styles]) => {
			// Filter styles based on keyword and selected filters
			const filteredGroup = styles.filter(item => {
				const { filters, name } = item as MapStyle;
				const matchesKeyword =
					filters.provider.toLowerCase().includes(lowerCaseKeyword) ||
					filters.attribute.some(attr => attr.toLowerCase().includes(lowerCaseKeyword)) ||
					filters.type.some(type => type.toLowerCase().includes(lowerCaseKeyword)) ||
					name.toLowerCase().includes(lowerCaseKeyword);

				const matchesFilters =
					(selectedFilters.Providers.length === 0 || selectedFilters.Providers.includes(filters.provider)) &&
					(selectedFilters.Attribute.length === 0 ||
						filters.attribute.some(attr => selectedFilters.Attribute.includes(attr))) &&
					(selectedFilters.Type.length === 0 || filters.type.some(type => selectedFilters.Type.includes(type)));

				return matchesKeyword && matchesFilters;
			});

			// Add the filtered group to the result if it's not empty
			return (
				filteredGroup.length > 0 ? [{ title: provider === GRAB ? `${GRAB}Maps` : provider }, ...filteredGroup] : []
			) as (
				| MapStyle
				| {
						title: string;
				  }
			)[];
		});
	};

	/**
	 * Handles changes to filter checkboxes by updating the selected filters state.
	 *
	 * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the input element.
	 * @param {string} filterCategory - The category of the filter being changed (e.g., 'Providers', 'Attribute', 'Type').
	 */
	const handleFilterChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>, filterCategory: string) => {
			const { name, checked } = e.target;
			setSelectedFilters(prevFilters => {
				const key = filterCategory as keyof MapStyleFilterTypes;
				return {
					...prevFilters,
					[key]: checked ? [...prevFilters[key], name] : prevFilters[key].filter(item => item !== name)
				};
			});
		},
		[setSelectedFilters]
	);

	const stylesWithTitles = addProviderTitle(MAP_STYLES, isGrabVisible);
	const searchAndFilteredResults = searchStyles(stylesWithTitles, searchValue, selectedFilters);
	const hasAnyFilterSelected =
		!!selectedFilters.Providers.length || !!selectedFilters.Attribute.length || !!selectedFilters.Type.length;

	const mapStyles = useMemo(
		() => (
			<Flex
				className={onlyMapStyles ? "map-styles-wrapper only-map-styles" : "map-styles-wrapper"}
				direction={"column"}
			>
				<Flex direction={"column"} gap={0}>
					<Flex
						className={showFilter ? "maps-styles-search with-filters" : "maps-styles-search"}
						marginBottom={showFilter ? 0 : "0.6rem"}
					>
						<SearchField
							data-testid="map-styles-search-field"
							className="map-styles-search-field"
							dir={langDir}
							label={t("search.text")}
							placeholder={t("map_buttons__search_placeholder.text") as string}
							hasSearchButton={false}
							hasSearchIcon={true}
							size={"large"}
							innerStartComponent={
								<Flex className="search-icon-container">
									<IconSearch className="search-icon" />
								</Flex>
							}
							value={searchValue}
							onChange={e => setSearchValue(e.target.value)}
							onClear={() => setSearchValue("")}
							onClick={() => !!showFilter && setShowFilter(false)}
							crossOrigin={undefined}
						/>
						<Flex className="filter-container">
							<Flex
								className="filter-icon-wrapper"
								onClick={() => setShowFilter(show => !show)}
								data-testid="filter-icon-wrapper"
							>
								<IconFilterFunnel className={showFilter || hasAnyFilterSelected ? "filter-icon live" : "filter-icon"} />
								<span className={hasAnyFilterSelected ? "filter-bubble live" : "filter-bubble"} />
							</Flex>
						</Flex>
					</Flex>
					{showFilter && (
						<Flex className="maps-filter-container" direction="column">
							{Object.entries(filters).map(([key, value]) => (
								<Flex key={key} direction="column">
									<Text as="strong" fontWeight={700} fontSize="1em">
										{key}
									</Text>
									{value.map((item: string, i) => {
										if (item === GRAB && !isGrabVisible) return null;
										return (
											<CheckboxField
												className="custom-checkbox"
												size={"large"}
												key={i}
												label={item === GRAB ? `${item}Maps` : item}
												name={item}
												value={item}
												checked={selectedFilters[key as keyof MapStyleFilterTypes].includes(item)}
												onChange={e => handleFilterChange(e, key)}
												data-testid={`filter-checkbox-${item}`}
												crossOrigin={undefined}
											/>
										);
									})}
								</Flex>
							))}
						</Flex>
					)}
				</Flex>
				{(!showFilter || onlyMapStyles) && (
					<Flex gap={0} direction="column" className={isGrabVisible ? "maps-container grab-visible" : "maps-container"}>
						<Flex gap={0} padding={onlyMapStyles ? "0 0 1.23rem" : "0 0.7rem 1.23rem 0.5rem"} wrap="wrap">
							{!searchAndFilteredResults.length && (
								<Flex width={"80%"} margin={"0 auto"} direction="column">
									<NotFoundCard
										title={t("map_buttons__no_styles_found_title.text") as string}
										text={`${t("map_buttons__no_styles_found_desc_1.text")}${
											noFilters ? t("map_buttons__no_styles_found_desc_2.text") : ""
										}`}
										textFontSize="0.93rem"
										textMargin={"0.6rem 0 0.9rem"}
										textPadding={noFilters ? "0" : undefined}
										actionButton={
											noFilters && (
												<Link className="clear-filters-button" onClick={resetFilters}>
													{t("map_buttons__clear_filters.text")}
												</Link>
											)
										}
									/>
								</Flex>
							)}
							{searchAndFilteredResults.map((item, i) =>
								"title" in item ? (
									<Flex key={i} width={"100%"} direction={"column"}>
										{i !== 0 && <Divider className="mb-divider" />}
										<Text as="strong" fontWeight={700} fontSize="1em" padding={"0.6rem 1.2rem 0.4rem"}>
											{item.title}
										</Text>
									</Flex>
								) : (
									(item.filters?.provider !== GRAB || (item.filters?.provider === GRAB && isGrabVisible)) && (
										<Flex key={i} marginBottom={"1.2rem"} width="33.33%">
											<Flex
												data-testid={`map-style-item-${item.id}`}
												className={item.id === currentMapStyle ? "mb-style-container selected" : "mb-style-container"}
												onClick={e => {
													e.preventDefault();
													e.stopPropagation();
													onChangeStyle(item.id);
												}}
												width="100%"
											>
												<Flex gap={0} position="relative">
													{(isLoading || isLoadingImg) && (
														<Placeholder position="absolute" width="100%" height="100%" />
													)}
													<img
														className={onlyMapStyles ? "map-image only-map" : "map-image"}
														src={item.image}
														alt={item.name}
														onLoad={() => setIsLoadingImg(false)}
													/>
												</Flex>
												{!isLoading && <Text marginTop="0.62rem">{t(item.name)}</Text>}
											</Flex>
										</Flex>
									)
								)
							)}
						</Flex>
					</Flex>
				)}
			</Flex>
		),
		[
			currentMapStyle,
			handleFilterChange,
			hasAnyFilterSelected,
			isGrabVisible,
			isLoading,
			isLoadingImg,
			onChangeStyle,
			searchAndFilteredResults,
			searchValue,
			selectedFilters,
			setSearchValue,
			showFilter,
			onlyMapStyles,
			noFilters,
			resetFilters,
			t,
			langDir
		]
	);

	if (onlyMapStyles) return mapStyles;

	return (
		<>
			<Flex data-testid="map-buttons-container" className="map-styles-geofence-and-tracker-container">
				<Flex
					data-testid="map-styles-button"
					ref={stylesCardTogglerRef}
					className={openStylesCard ? "map-styles-button active" : "map-styles-button"}
					onClick={toggleMapStyles}
					data-tooltip-id="map-styles-button"
					data-tooltip-place="left"
					data-tooltip-content={t("tooltip__mps.text")}
				>
					<IconMapSolid />
				</Flex>
				{!openStylesCard && <Tooltip id="map-styles-button" />}
				<Divider className="button-divider" />
				<Flex
					data-testid="geofence-control-button"
					className={isAddingGeofence ? "geofence-button active" : "geofence-button"}
					onClick={onClickGeofence}
					data-tooltip-id="geofence-control-button"
					data-tooltip-place="left"
					data-tooltip-content={t("geofence.text")}
				>
					<IconGeofencePlusSolid />
				</Flex>
				<Tooltip id="geofence-control-button" />
				<Divider className="button-divider" />
				<Flex
					data-testid="tracker-control-button"
					className={
						isAuthTrackerDisclaimerModalOpen || isAuthTrackerBoxOpen ? "tracker-button active" : "tracker-button"
					}
					onClick={onClickTracker}
					data-tooltip-id="tracker-control-button"
					data-tooltip-place="left"
					data-tooltip-content={t("tracker.text")}
				>
					<IconRadar />
				</Flex>
				<Tooltip id="tracker-control-button" />
			</Flex>
			{openStylesCard && (
				<Card data-testid="map-styles-card" ref={stylesCardRef} className="map-styles-card">
					<Flex className="map-styles-header">
						<Text margin="1.23rem 0rem" fontFamily="AmazonEmber-Bold" fontSize="1.23rem">
							{t("map_style.text")}
						</Text>
						<Flex className="map-styles-icon-close-container" onClick={() => setOpenStylesCard(false)}>
							<IconClose />
						</Flex>
					</Flex>
					<Flex className="ms-info-container">
						<Text variation="tertiary" textAlign={isLtr ? "start" : "end"}>
							{t("map_buttons__info.text")}
						</Text>
					</Flex>
					{mapStyles}
				</Card>
			)}
		</>
	);
};

export default MapButtons;

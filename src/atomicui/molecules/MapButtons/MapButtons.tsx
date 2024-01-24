/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import {
	ChangeEvent,
	Dispatch,
	FC,
	MutableRefObject,
	SetStateAction,
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from "react";

import {
	Button,
	Card,
	CheckboxField,
	Divider,
	Flex,
	Link,
	Placeholder,
	SearchField,
	Text,
	View
} from "@aws-amplify/ui-react";
import { IconClose, IconFilterFunnel, IconGeofencePlusSolid, IconMapSolid, IconRadar, IconSearch } from "@demo/assets";
import { NotFoundCard } from "@demo/atomicui/molecules";
import { appConfig } from "@demo/core/constants";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useAmplifyAuth, useAmplifyMap, useAwsGeofence, useUnauthSimulation } from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
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
import { EventTypeEnum, MenuItemEnum, OpenDataMapEnum, ResponsiveUIEnum, TriggeredByEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { isAndroid, isIOS } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { RefHandles } from "react-spring-bottom-sheet/dist/types";
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
const searchHandDeviceWidth = "36px";
const searchDesktopWidth = "100%";
const { map_styles } = ResponsiveUIEnum;

export interface MapButtonsProps {
	renderedUpon: string;
	openStylesCard: boolean;
	setOpenStylesCard: (b: boolean) => void;
	onCloseSidebar: () => void;
	onOpenSignInModal: () => void;
	isGrabVisible: boolean;
	showGrabDisclaimerModal: boolean;
	onShowGridLoader: () => void;
	handleMapStyleChange: (id: EsriMapEnum | HereMapEnum | GrabMapEnum | OpenDataMapEnum) => void;
	searchValue: string;
	setSearchValue: (s: string) => void;
	selectedFilters: MapStyleFilterTypes;
	setSelectedFilters: Dispatch<SetStateAction<MapStyleFilterTypes>>;
	isLoading?: boolean;
	onlyMapStyles?: boolean;
	resetSearchAndFilters?: () => void;
	showOpenDataDisclaimerModal: boolean;
	isHandDevice?: boolean;
	handleMapProviderChange?: (provider: MapProviderEnum, triggeredBy: TriggeredByEnum) => void;
	isAuthGeofenceBoxOpen: boolean;
	onSetShowAuthGeofenceBox: (b: boolean) => void;
	isAuthTrackerDisclaimerModalOpen: boolean;
	isAuthTrackerBoxOpen: boolean;
	isSettingsModal?: boolean;
	onShowAuthTrackerDisclaimerModal: () => void;
	onSetShowAuthTrackerBox: (b: boolean) => void;
	onShowUnauthSimulationDisclaimerModal: () => void;
	isUnauthGeofenceBoxOpen: boolean;
	isUnauthTrackerBoxOpen: boolean;
	onSetShowUnauthGeofenceBox: (b: boolean) => void;
	onSetShowUnauthTrackerBox: (b: boolean) => void;
	bottomSheetRef?: MutableRefObject<RefHandles | null>;
}

const MapButtons: FC<MapButtonsProps> = ({
	renderedUpon,
	openStylesCard,
	setOpenStylesCard,
	onCloseSidebar,
	onOpenSignInModal,
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
	isHandDevice,
	handleMapProviderChange,
	isAuthGeofenceBoxOpen,
	onSetShowAuthGeofenceBox,
	isAuthTrackerDisclaimerModalOpen,
	onShowAuthTrackerDisclaimerModal,
	isAuthTrackerBoxOpen,
	isSettingsModal = false,
	onSetShowAuthTrackerBox,
	onShowUnauthSimulationDisclaimerModal,
	isUnauthGeofenceBoxOpen,
	isUnauthTrackerBoxOpen,
	onSetShowUnauthGeofenceBox,
	onSetShowUnauthTrackerBox,
	bottomSheetRef
}) => {
	const [tempFilters, setTempFilters] = useState(selectedFilters);
	const [isLoadingImg, setIsLoadingImg] = useState(true);
	const [showFilter, setShowFilter] = useState(false);
	const [searchWidth, setSearchWidth] = useState(isHandDevice ? searchHandDeviceWidth : searchDesktopWidth);
	const stylesCardRef = useRef<HTMLDivElement | null>(null);
	const stylesCardTogglerRef = useRef<HTMLDivElement | null>(null);
	const { credentials, isUserAwsAccountConnected } = useAmplifyAuth();
	const { mapProvider: currentMapProvider, mapStyle: currentMapStyle } = useAmplifyMap();
	const { isAddingGeofence, setIsAddingGeofence } = useAwsGeofence();
	const isAuthenticated = !!credentials?.authenticated;
	const { isTablet, isMobile, isDesktop, isDesktopBrowser } = useDeviceMediaQuery();
	const { t, i18n } = useTranslation();
	const { bottomSheetCurrentHeight = 0, ui, setBottomSheetHeight, setBottomSheetMinHeight } = useBottomSheet();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const settingsTablet = isTablet && !!onlyMapStyles && isSettingsModal;
	const filterIconWrapperRef = useRef<HTMLDivElement>(null);
	const searchFieldRef = useRef<HTMLInputElement>(null);
	const clearIconContainerRef = useRef<HTMLDivElement>(null);
	const { hideGeofenceTrackerShortcut } = useUnauthSimulation();

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				!filterIconWrapperRef?.current?.contains(event.target as Node) &&
				!searchFieldRef?.current?.contains(event.target as Node) &&
				!clearIconContainerRef?.current?.contains(event.target as Node)
			) {
				if (!showFilter) {
					isHandDevice && setSearchWidth(searchHandDeviceWidth);
				}
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isHandDevice, setSearchWidth, showFilter]);

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

	const onClickGeofenceTracker = (menuItem: MenuItemEnum) => {
		onCloseSidebar();

		if (isUserAwsAccountConnected) {
			if (isAuthenticated) {
				if (menuItem === MenuItemEnum.GEOFENCE) {
					isAuthTrackerBoxOpen && onSetShowAuthTrackerBox(!isAuthTrackerBoxOpen);
					onSetShowAuthGeofenceBox(!isAuthGeofenceBoxOpen);
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
					isAddingGeofence && setIsAddingGeofence(!isAddingGeofence);
					isAuthGeofenceBoxOpen && onSetShowAuthGeofenceBox(!isAuthGeofenceBoxOpen);
					currentMapProvider === MapProviderEnum.ESRI
						? onShowAuthTrackerDisclaimerModal()
						: onSetShowAuthTrackerBox(!isAuthTrackerBoxOpen);
				}
			} else {
				onOpenSignInModal();
			}
		} else {
			if (currentMapProvider === MapProviderEnum.GRAB) {
				onShowUnauthSimulationDisclaimerModal();
			} else {
				if (menuItem === MenuItemEnum.GEOFENCE) {
					isUnauthTrackerBoxOpen && onSetShowUnauthTrackerBox(!isUnauthTrackerBoxOpen);
					onSetShowUnauthGeofenceBox(!isUnauthGeofenceBoxOpen);
				} else {
					isUnauthGeofenceBoxOpen && onSetShowUnauthGeofenceBox(!isUnauthGeofenceBoxOpen);
					onSetShowUnauthTrackerBox(!isUnauthTrackerBoxOpen);
				}
			}
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
	 * @param {ChangeEvent<HTMLInputElement>} e - The change event from the input element.
	 * @param {string} filterCategory - The category of the filter being changed (e.g., 'Providers', 'Attribute', 'Type').
	 */

	const handleFilterChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>, filterCategory: string) => {
			const { name, checked } = e.target;
			const key = filterCategory as keyof MapStyleFilterTypes;

			const updatedFilters = {
				...tempFilters,
				[key]: checked ? [...tempFilters[key], name] : tempFilters[key].filter(item => item !== name)
			};

			if (isHandDevice) {
				setTempFilters(updatedFilters);
			} else {
				const desktopUpdatedFilters = {
					...selectedFilters,
					[key]: checked ? [...selectedFilters[key], name] : selectedFilters[key].filter(item => item !== name)
				};
				setSelectedFilters(desktopUpdatedFilters);
			}
		},
		[tempFilters, isHandDevice, selectedFilters, setSelectedFilters]
	);

	const applyMobileFilters = useCallback(() => {
		if (isHandDevice) {
			setSelectedFilters(tempFilters);
			setShowFilter(false);
			setSearchWidth(!!searchValue ? searchHandDeviceWidth : searchHandDeviceWidth);
		}
	}, [isHandDevice, setSelectedFilters, tempFilters, searchValue]);

	// Invoke this when dialog is closed without applying filters in mobile mode
	const discardChanges = useCallback(() => {
		if (isHandDevice) {
			// revert tempFilters to the applied selectedFilters
			setTempFilters(selectedFilters);
		}
	}, [selectedFilters, isHandDevice]);

	const clearFilters = useCallback(() => {
		if (isHandDevice) {
			const initialFilterValues = {
				Providers: [],
				Attribute: [],
				Type: []
			};
			setTempFilters(initialFilterValues);
			setSelectedFilters(initialFilterValues);
		}
	}, [isHandDevice, setSelectedFilters]);

	const stylesWithTitles = addProviderTitle(MAP_STYLES, isGrabVisible);
	const searchAndFilteredResults = searchStyles(stylesWithTitles, searchValue, selectedFilters);
	const hasAnyFilterSelected =
		!!selectedFilters.Providers.length || !!selectedFilters.Attribute.length || !!selectedFilters.Type.length;
	const mapProviderArray = useMemo(() => {
		return Object.values(MapProviderEnum).filter(mapProvider => {
			if (isGrabVisible) {
				return mapProvider;
			} else {
				return mapProvider !== MapProviderEnum.GRAB;
			}
		});
	}, [isGrabVisible]);

	const mapStyles = useMemo(
		() => (
			<Flex
				data-testid="map-styles-wrapper"
				className={onlyMapStyles ? "map-styles-wrapper only-map-styles" : "map-styles-wrapper"}
				direction={"column"}
			>
				<Flex direction={"column"} gap={0} marginBottom={isHandDevice && showFilter ? "5rem" : "0"}>
					<Flex
						className={`maps-styles-search ${!!isHandDevice ? "responsive-search" : ""} ${
							showFilter ? "with-filters" : ""
						}`}
						marginBottom={showFilter ? 0 : "0.6rem"}
						padding={isHandDevice && searchWidth === searchHandDeviceWidth ? "0 0 0.5rem 1.2rem" : "0 1.2rem"}
					>
						<SearchField
							ref={searchFieldRef}
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
									<IconSearch className="search-bar-icon" />
								</Flex>
							}
							innerEndComponent={null}
							value={searchValue}
							onChange={e => setSearchValue(e.target.value)}
							onClick={() => {
								isHandDevice && setSearchWidth(searchDesktopWidth);
								!!showFilter && setShowFilter(false);

								if ((isAndroid || isIOS) && !isDesktopBrowser) {
									if (bottomSheetCurrentHeight < document.documentElement.clientHeight * 0.4) {
										bottomSheetRef?.current?.snapTo(window.innerHeight);
										setTimeout(() => {
											setBottomSheetHeight(window.innerHeight);
											setBottomSheetMinHeight(BottomSheetHeights.explore.min);
										}, 200);
									}
								}
							}}
							onBlur={() => {
								isHandDevice && searchValue && setSearchWidth(searchDesktopWidth);

								if ((isAndroid || isIOS) && !isDesktopBrowser) {
									setTimeout(() => {
										setBottomSheetMinHeight(window.innerHeight - 10);
										setBottomSheetHeight(window.innerHeight);
									}, 200);

									setTimeout(() => {
										setBottomSheetMinHeight(BottomSheetHeights.explore.min);
										setBottomSheetHeight(window.innerHeight);
									}, 500);
								}
							}}
							crossOrigin={undefined}
							width={searchWidth}
						/>
						<Flex className="filter-container" gap="0">
							{!!searchValue && searchWidth === searchDesktopWidth && (
								<Flex
									ref={clearIconContainerRef}
									onClick={() => {
										setSearchValue("");
										setShowFilter(false);
									}}
									margin="0 0.4rem"
								>
									<IconClose className="search-bar-icon" />
								</Flex>
							)}
							<View
								data-testid="filter-icon-wrapper"
								ref={filterIconWrapperRef}
								className="filter-icon-wrapper"
								onClick={() => {
									setShowFilter(show => {
										isHandDevice && show ? setSearchWidth(searchHandDeviceWidth) : setSearchWidth(searchDesktopWidth);
										return !show;
									});
									discardChanges();
								}}
								paddingRight={isHandDevice ? "0" : "0.7rem"}
							>
								<IconFilterFunnel className={showFilter || hasAnyFilterSelected ? "filter-icon live" : "filter-icon"} />
								<span className={hasAnyFilterSelected ? "filter-bubble live" : "filter-bubble"} />
							</View>
						</Flex>
						{searchWidth === searchHandDeviceWidth && (
							<Flex gap="0.5rem" className="map-providers-container-mobile">
								{mapProviderArray.map(provider => (
									<Button
										key={provider}
										className={currentMapProvider === provider ? "active-button" : ""}
										onClick={() =>
											handleMapProviderChange && handleMapProviderChange(provider, TriggeredByEnum.SETTINGS_MODAL)
										}
									>
										{provider === MapProviderEnum.GRAB ? `${MapProviderEnum.GRAB}Maps` : provider}
									</Button>
								))}
							</Flex>
						)}
					</Flex>
					{showFilter && (
						<Flex
							data-testid="maps-filter-container"
							className={`maps-filter-container ${isHandDevice ? "responsive-filter" : ""}`}
							direction="column"
						>
							{Object.entries(filters).map(([key, value]) => (
								<Flex key={key} direction="column">
									<Text data-testid={`filter-title-${key}`} as="strong" fontWeight={700} fontSize="1em">
										{key}
									</Text>
									{value.map((item: string, i) => {
										if (item === GRAB && !isGrabVisible) return null;
										return (
											<CheckboxField
												data-testid={`filter-checkbox-${item}`}
												className="custom-checkbox"
												size={"large"}
												key={i}
												label={item === GRAB ? `${item}Maps` : item}
												name={item}
												value={item}
												checked={
													isHandDevice
														? tempFilters[key as keyof MapStyleFilterTypes].includes(item)
														: selectedFilters[key as keyof MapStyleFilterTypes].includes(item)
												}
												onChange={e => handleFilterChange(e, key)}
												crossOrigin={undefined}
											/>
										);
									})}
								</Flex>
							))}
						</Flex>
					)}
				</Flex>
				{(!showFilter || (onlyMapStyles && !isHandDevice)) && (
					<Flex
						data-testid="map-styles-container"
						gap={0}
						direction="column"
						className={isGrabVisible ? "maps-container grab-visible" : "maps-container"}
					>
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
										<Flex key={i} width={settingsTablet ? "auto" : "33.33%"} height="130px" alignItems="flex-start">
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
														className={`${isHandDevice ? "hand-device-img" : ""} ${
															isMobile && onlyMapStyles ? "only-map" : ""
														} map-image`}
														src={item.image}
														alt={item.name}
														onLoad={() => setIsLoadingImg(false)}
													/>
												</Flex>
												{!isLoading && (
													<Text marginTop="0.62rem" textAlign="center">
														{t(item.name)}
													</Text>
												)}
											</Flex>
										</Flex>
									)
								)
							)}
						</Flex>
					</Flex>
				)}
				{isHandDevice && showFilter && bottomSheetCurrentHeight > 150 && (
					<Flex className="responsive-map-footer">
						<Button variation="link" className="clear-selection-button" onClick={clearFilters}>
							{t("map_buttons__clear_selections.text")}
						</Button>
						<Button className="apply-button" variation="primary" onClick={applyMobileFilters}>
							{t("map_buttons__apply_filters.text")}
						</Button>
					</Flex>
				)}
			</Flex>
		),
		[
			onlyMapStyles,
			isHandDevice,
			showFilter,
			searchWidth,
			langDir,
			t,
			searchValue,
			hasAnyFilterSelected,
			isGrabVisible,
			searchAndFilteredResults,
			noFilters,
			resetFilters,
			bottomSheetCurrentHeight,
			clearFilters,
			applyMobileFilters,
			setSearchValue,
			isDesktopBrowser,
			bottomSheetRef,
			setBottomSheetHeight,
			setBottomSheetMinHeight,
			discardChanges,
			currentMapProvider,
			handleMapProviderChange,
			tempFilters,
			selectedFilters,
			handleFilterChange,
			settingsTablet,
			currentMapStyle,
			isLoading,
			isLoadingImg,
			isMobile,
			onChangeStyle,
			mapProviderArray
		]
	);

	if (onlyMapStyles) return mapStyles;
	else if (!isDesktop) return null;
	return (
		<>
			<Flex
				data-testid="map-buttons-container"
				className="map-styles-geofence-and-tracker-container"
				height={hideGeofenceTrackerShortcut ? "2.4rem" : "7.38rem"}
			>
				<Flex
					data-testid="map-styles-button"
					ref={stylesCardTogglerRef}
					className={openStylesCard || ui === map_styles ? "map-styles-button active" : "map-styles-button"}
					onClick={toggleMapStyles}
					data-tooltip-id="map-styles-button"
					data-tooltip-place="left"
					data-tooltip-content={t("tooltip__mps.text")}
				>
					<IconMapSolid />
				</Flex>
				{!openStylesCard && <Tooltip id="map-styles-button" />}
				{isDesktop && !hideGeofenceTrackerShortcut && (
					<>
						<Divider className="button-divider" />
						<Flex
							data-testid="geofence-control-button"
							className={isAddingGeofence ? "geofence-button active" : "geofence-button"}
							onClick={() => onClickGeofenceTracker(MenuItemEnum.GEOFENCE)}
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
							onClick={() => onClickGeofenceTracker(MenuItemEnum.TRACKER)}
							data-tooltip-id="tracker-control-button"
							data-tooltip-place="left"
							data-tooltip-content={t("tracker.text")}
						>
							<IconRadar />
						</Flex>
					</>
				)}
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

export default memo(MapButtons);

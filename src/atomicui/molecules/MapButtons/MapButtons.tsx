/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Card, Divider, Flex, Placeholder, Text } from "@aws-amplify/ui-react";
import { IconClose, IconDark, IconGeofencePlusSolid, IconLight, IconMapSolid, IconRadar } from "@demo/assets/svgs";
import { MapLanguageDropdown, PoliticalViewDropdown } from "@demo/atomicui/atoms";
import { appConfig } from "@demo/core/constants";
import { useAuth, useGeofence, useMap, useUnauthSimulation } from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import {
	EventTypeEnum,
	MapColorSchemeEnum,
	MapStyleEnum,
	MenuItemEnum,
	ResponsiveUIEnum,
	TriggeredByEnum
} from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { map_styles } = ResponsiveUIEnum;
const {
	MAP_RESOURCES: { MAP_STYLES, MAP_COLOR_SCHEMES }
} = appConfig;

export interface MapButtonsProps {
	renderedUpon: string;
	openStylesCard: boolean;
	setOpenStylesCard: (b: boolean) => void;
	onCloseSidebar: () => void;
	onOpenSignInModal: () => void;
	onShowGridLoader: () => void;
	isLoading?: boolean;
	onlyMapStyles?: boolean;
	isHandDevice?: boolean;
	isAuthGeofenceBoxOpen: boolean;
	onSetShowAuthGeofenceBox: (b: boolean) => void;
	isAuthTrackerBoxOpen: boolean;
	isSettingsModal?: boolean;
	onSetShowAuthTrackerBox: (b: boolean) => void;
	isUnauthGeofenceBoxOpen: boolean;
	isUnauthTrackerBoxOpen: boolean;
	onSetShowUnauthGeofenceBox: (b: boolean) => void;
	onSetShowUnauthTrackerBox: (b: boolean) => void;
}

const MapButtons: FC<MapButtonsProps> = ({
	renderedUpon,
	openStylesCard,
	setOpenStylesCard,
	onCloseSidebar,
	onOpenSignInModal,
	onShowGridLoader,
	isLoading = false,
	onlyMapStyles = false,
	isHandDevice,
	isAuthGeofenceBoxOpen,
	onSetShowAuthGeofenceBox,
	isAuthTrackerBoxOpen,
	onSetShowAuthTrackerBox,
	isUnauthGeofenceBoxOpen,
	isUnauthTrackerBoxOpen,
	onSetShowUnauthGeofenceBox,
	onSetShowUnauthTrackerBox
}) => {
	const [isLoadingImg, setIsLoadingImg] = useState(true);
	const stylesCardRef = useRef<HTMLDivElement | null>(null);
	const stylesCardTogglerRef = useRef<HTMLDivElement | null>(null);
	const { credentials, userProvidedValues } = useAuth();
	const { mapStyle, setMapStyle, mapColorScheme, setMapColorScheme, setMapPoliticalView } = useMap();
	const { isAddingGeofence, setIsAddingGeofence } = useGeofence();
	const isAuthenticated = !!credentials?.authenticated;
	const { isMobile, isDesktop } = useDeviceMediaQuery();
	const { t } = useTranslation();
	const { ui } = useBottomSheet();
	const { hideGeofenceTrackerShortcut } = useUnauthSimulation();

	const isColorSchemeDisabled = useMemo(
		() => [MapStyleEnum.HYBRID, MapStyleEnum.SATELLITE].includes(mapStyle),
		[mapStyle]
	);

	const handleClickOutside = useCallback(
		(ev: MouseEvent) => {
			if (
				stylesCardRef.current &&
				!stylesCardRef.current.contains(ev.target as Node) &&
				stylesCardTogglerRef.current &&
				!stylesCardTogglerRef.current.contains(ev.target as Node)
			) {
				setOpenStylesCard(false);
			}
		},
		[setOpenStylesCard]
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
	};

	const onClickGeofenceTracker = (menuItem: MenuItemEnum) => {
		onCloseSidebar();

		if (userProvidedValues) {
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
					onSetShowAuthTrackerBox(!isAuthTrackerBoxOpen);
				}
			} else {
				onOpenSignInModal();
			}
		} else {
			if (menuItem === MenuItemEnum.GEOFENCE) {
				isUnauthTrackerBoxOpen && onSetShowUnauthTrackerBox(!isUnauthTrackerBoxOpen);
				onSetShowUnauthGeofenceBox(!isUnauthGeofenceBoxOpen);
			} else {
				isUnauthGeofenceBoxOpen && onSetShowUnauthGeofenceBox(!isUnauthGeofenceBoxOpen);
				onSetShowUnauthTrackerBox(!isUnauthTrackerBoxOpen);
			}
		}
	};

	const handleMapStyleChange = useCallback(
		(id: string, style: MapStyleEnum) => {
			if (mapStyle !== style) {
				onShowGridLoader();
				style === MapStyleEnum.SATELLITE &&
					setMapPoliticalView({ alpha2: "", alpha3: "", desc: "no_political_view.text", isSupportedByPlaces: false });
				setMapStyle(style);
				record([
					{
						EventType: EventTypeEnum.MAP_STYLE_CHANGE,
						Attributes: { id, style, triggeredBy: renderedUpon }
					}
				]);
			}
		},
		[mapStyle, onShowGridLoader, renderedUpon, setMapPoliticalView, setMapStyle]
	);

	const handleMapColorSchemeChange = useCallback(
		(id: string, colorScheme: MapColorSchemeEnum) => {
			if (mapColorScheme !== colorScheme) {
				onShowGridLoader();
				setMapColorScheme(colorScheme);
				record([
					{
						EventType: EventTypeEnum.MAP_STYLE_CHANGE,
						Attributes: { id, colorScheme, triggeredBy: renderedUpon }
					}
				]);
			}
		},
		[mapColorScheme, onShowGridLoader, renderedUpon, setMapColorScheme]
	);

	const renderMapStyles = useMemo(
		() => (
			<Flex data-testid="map-styles-wrapper" className="map-styles-wrapper">
				<Flex gap={0} width="100%" direction="column" marginBottom={isHandDevice ? "5rem" : "0"}>
					<Flex data-testid="map-styles-container" gap={0} direction="column" className="maps-container">
						<Flex gap={0} padding="0 1rem 1.23rem 1rem" wrap="wrap" justifyContent="space-between">
							{MAP_STYLES.map(({ id, name, image }) => (
								<Flex
									key={id}
									width="100%"
									maxWidth="6.54rem"
									height="100%"
									maxHeight="8.08rem"
									alignItems="center"
									justifyContent="center"
									marginTop="0.5rem"
								>
									<Flex
										data-testid={`map-style-item-${name}`}
										className={mapStyle === name ? "mb-style-container selected" : "mb-style-container"}
										width="100%"
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();
											handleMapStyleChange(id, name);
										}}
									>
										<Flex gap={0} position="relative">
											{(isLoading || isLoadingImg) && <Placeholder position="absolute" width="100%" height="100%" />}
											<img
												className={`${isHandDevice ? "hand-device-img" : ""} ${
													isMobile && onlyMapStyles ? "only-map" : ""
												} map-image`}
												src={image}
												alt={name}
												onLoad={() => setIsLoadingImg(false)}
											/>
										</Flex>
										{!isLoading && (
											<Text marginTop="0.62rem" textAlign="center">
												{t(name)}
											</Text>
										)}
									</Flex>
								</Flex>
							))}
						</Flex>
						<Flex gap={0} padding="1rem">
							<Flex
								gap={0}
								borderRadius="0.61rem"
								backgroundColor="var(--light-color-2)"
								height="3.23rem"
								width="100%"
								alignItems="center"
								padding="0.31rem"
							>
								{MAP_COLOR_SCHEMES.map(({ id, name }) => (
									<Flex
										key={id}
										style={{
											gap: 0,
											flex: 1,
											justifyContent: "center",
											alignItems: "center",
											borderRadius: "0.46rem",
											height: "2.62rem",
											backgroundColor: isColorSchemeDisabled
												? "var(--light-color-2)"
												: mapColorScheme === name
												? "var(--white-color)"
												: "var(--light-color-2)",
											cursor: isColorSchemeDisabled ? "not-allowed" : "pointer"
										}}
										onClick={e => {
											if (!isColorSchemeDisabled) {
												e.preventDefault();
												e.stopPropagation();
												handleMapColorSchemeChange(id, name);
											}
										}}
									>
										{name === MapColorSchemeEnum.LIGHT ? (
											<IconLight fill={isColorSchemeDisabled ? "var(--grey-color-9)" : "var(--tertiary-color)"} />
										) : (
											<IconDark fill={isColorSchemeDisabled ? "var(--grey-color-9)" : "var(--tertiary-color)"} />
										)}
										<Text
											className="medium"
											style={{
												fontSize: "1.08rem",
												lineHeight: "1.29rem",
												marginLeft: "1rem",
												color: isColorSchemeDisabled
													? "var(--grey-color-9)"
													: name === MapColorSchemeEnum.LIGHT
													? "var(--primary-color)"
													: "var(--tertiary-color)"
											}}
										>
											{t(name)}
										</Text>
									</Flex>
								))}
							</Flex>
						</Flex>
						<Flex gap={0} padding="1rem">
							<PoliticalViewDropdown bordered disabled={mapStyle === MapStyleEnum.SATELLITE} />
						</Flex>
						<Flex gap={0} padding="1rem">
							<MapLanguageDropdown bordered />
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		),
		[
			handleMapColorSchemeChange,
			handleMapStyleChange,
			isColorSchemeDisabled,
			isHandDevice,
			isLoading,
			isLoadingImg,
			isMobile,
			mapColorScheme,
			mapStyle,
			onlyMapStyles,
			t
		]
	);

	if (onlyMapStyles) return renderMapStyles;
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
							className={isAuthTrackerBoxOpen ? "tracker-button active" : "tracker-button"}
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
					{renderMapStyles}
				</Card>
			)}
		</>
	);
};

export default memo(MapButtons);

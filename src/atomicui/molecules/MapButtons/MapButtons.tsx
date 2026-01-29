/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Card, Divider, Flex, Placeholder, Text } from "@aws-amplify/ui-react";
import { IconClose, IconDark, IconGeofencePlusSolid, IconLight, IconMapSolid, IconRadar } from "@demo/assets/svgs";
import { MapLanguageDropdown, PoliticalViewDropdown } from "@demo/atomicui/atoms";
import { appConfig } from "@demo/core/constants";
import { useMap, useUnauthSimulation } from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { EventTypeEnum, MapColorSchemeEnum, MapStyleEnum, ResponsiveUIEnum } from "@demo/types/Enums";
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
	onShowGridLoader: () => void;
	isLoading?: boolean;
	onlyMapStyles?: boolean;
	isHandDevice?: boolean;
	isSettingsModal?: boolean;
	isUnauthSimulationOpen: boolean;
	onSetShowUnauthSimulation: (b: boolean) => void;
}

const MapButtons: FC<MapButtonsProps> = ({
	renderedUpon,
	openStylesCard,
	setOpenStylesCard,
	onCloseSidebar,
	onShowGridLoader,
	isLoading = false,
	onlyMapStyles = false,
	isHandDevice,
	isUnauthSimulationOpen,
	onSetShowUnauthSimulation
}) => {
	const [isLoadingImg, setIsLoadingImg] = useState(true);
	const stylesCardRef = useRef<HTMLDivElement | null>(null);
	const stylesCardTogglerRef = useRef<HTMLDivElement | null>(null);
	const { mapStyle, setMapStyle, mapColorScheme, setMapColorScheme, setMapPoliticalView } = useMap();
	const { isMobile, isDesktop } = useDeviceMediaQuery();
	const { t } = useTranslation();
	const { ui } = useBottomSheet();
	const { hideGeofenceTrackerShortcut, setHideGeofenceTrackerShortcut } = useUnauthSimulation();

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

	const onClickUnauthSimulation = () => {
		onCloseSidebar();
		onSetShowUnauthSimulation(!isUnauthSimulationOpen);
		setHideGeofenceTrackerShortcut(true);
	};

	const handleMapStyleChange = useCallback(
		(id: string, style: MapStyleEnum) => {
			if (mapStyle !== style) {
				onShowGridLoader();
				style === MapStyleEnum.SATELLITE &&
					setMapPoliticalView({ alpha2: "", alpha3: "", desc: "no_political_view.text", isSupportedByPlaces: false });
				setMapStyle(style);
			}
		},
		[mapStyle, onShowGridLoader, renderedUpon, setMapPoliticalView, setMapStyle]
	);

	const handleMapColorSchemeChange = useCallback(
		(id: string, colorScheme: MapColorSchemeEnum) => {
			if (mapColorScheme !== colorScheme) {
				onShowGridLoader();
				setMapColorScheme(colorScheme);
			}
		},
		[mapColorScheme, onShowGridLoader, renderedUpon, setMapColorScheme]
	);

	const renderMapStyles = useMemo(
		() => (
			<Flex data-testid="map-styles-wrapper" className="map-styles-wrapper">
				<Flex gap="0" width="100%" direction="column" marginBottom={isHandDevice ? "5rem" : "0"}>
					<Flex data-testid="map-styles-container" gap="0" direction="column" className="maps-container">
						<Flex gap="0" padding="0 1rem 1.23rem 1rem" wrap="wrap" justifyContent="space-between">
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
										<Flex gap="0" position="relative">
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
						<Flex gap="0" padding="1rem">
							<Flex
								gap="0"
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
						<Flex gap="0" padding="1rem" direction="column">
							<Text className="bold small-text" marginBottom="0.4rem">
								{t("political_views.text")}
							</Text>
							<PoliticalViewDropdown bordered disabled={mapStyle === MapStyleEnum.SATELLITE} />
						</Flex>
						<Flex gap="0" padding="1rem" direction="column">
							<Text className="bold small-text" marginBottom="0.4rem">
								{t("map_languages.text")}
							</Text>
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
							className="geofence-button"
							onClick={() => onClickUnauthSimulation()}
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
							className="tracker-button"
							onClick={() => onClickUnauthSimulation()}
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

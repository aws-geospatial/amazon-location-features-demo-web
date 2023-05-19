/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Card, Divider, Flex, Placeholder, Radio, View } from "@aws-amplify/ui-react";
import { IconClose, IconGeofencePlusSolid, IconInfoSolid, IconMapSolid } from "@demo/assets";
import { TextEl } from "@demo/atomicui/atoms";
import { appConfig } from "@demo/core/constants";
import { useAmplifyAuth, useAmplifyMap, useAws, useAwsGeofence } from "@demo/hooks";
import { EsriMapEnum, GrabMapEnum, HereMapEnum, MapProviderEnum } from "@demo/types";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { ESRI, HERE, GRAB } = MapProviderEnum;
const {
	MAP_RESOURCES: {
		GRAB_SUPPORTED_AWS_REGIONS,
		MAP_STYLES: { ESRI_STYLES, HERE_STYLES, GRAB_STYLES }
	}
} = appConfig;

interface MapButtonsProps {
	openStylesCard: boolean;
	setOpenStylesCard: (b: boolean) => void;
	onCloseSidebar: () => void;
	onOpenConnectAwsAccountModal: () => void;
	onOpenSignInModal: () => void;
	onShowGeofenceBox: () => void;
	resetAppState: () => void;
	showGrabDisclaimerModal: boolean;
	onShowGrabDisclaimerModal: (mapStyle?: GrabMapEnum) => void;
	onShowGridLoader: () => void;
}

const MapButtons: React.FC<MapButtonsProps> = ({
	openStylesCard,
	setOpenStylesCard,
	onCloseSidebar,
	onOpenConnectAwsAccountModal,
	onOpenSignInModal,
	onShowGeofenceBox,
	resetAppState,
	showGrabDisclaimerModal,
	onShowGrabDisclaimerModal,
	onShowGridLoader
}) => {
	const [isLoadingImg, setIsLoadingImg] = useState(true);
	const stylesCardRef = useRef<HTMLDivElement | null>(null);
	const stylesCardTogglerRef = useRef<HTMLDivElement | null>(null);
	const { credentials, isUserAwsAccountConnected, region, switchToDefaultRegionStack } = useAmplifyAuth();
	const { resetStore: resetAwsStore } = useAws();
	const {
		mapProvider: currentMapProvider,
		setMapProvider,
		mapStyle: currentMapStyle,
		setMapStyle,
		setAttributionText
	} = useAmplifyMap();
	const { isAddingGeofence, setIsAddingGeofence } = useAwsGeofence();
	const isAuthenticated = !!credentials?.authenticated;
	const isGrabVisible =
		!isUserAwsAccountConnected || (isUserAwsAccountConnected && GRAB_SUPPORTED_AWS_REGIONS.includes(region));

	const handleClickOutside = useCallback(
		(ev: MouseEvent) => {
			if (
				stylesCardRef.current &&
				!stylesCardRef.current.contains(ev.target as Node) &&
				stylesCardTogglerRef.current &&
				!stylesCardTogglerRef.current.contains(ev.target as Node) &&
				!showGrabDisclaimerModal
			) {
				setOpenStylesCard(false);
			}
		},
		[showGrabDisclaimerModal, setOpenStylesCard]
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
		} else {
			onPrompt();
		}
	};

	const onMapProviderChange = useCallback(
		(mapProvider: MapProviderEnum) => {
			onShowGridLoader();
			setIsLoadingImg(true);

			if (mapProvider === GRAB) {
				/* Switching from different map provider and style to Grab map provider and style */
				onShowGrabDisclaimerModal();
			} else {
				if (currentMapProvider === GRAB) {
					/* Switching from Grab map provider to different map provider and style */
					switchToDefaultRegionStack();
					resetAwsStore();
					setMapProvider(mapProvider);
					setMapStyle(mapProvider === ESRI ? EsriMapEnum.ESRI_LIGHT : HereMapEnum.HERE_EXPLORE);
				} else {
					/* Switching between Esri and HERE map provider and style */
					setMapProvider(mapProvider);
					setMapStyle(mapProvider === ESRI ? EsriMapEnum.ESRI_LIGHT : HereMapEnum.HERE_EXPLORE);
				}

				resetAppState();
			}

			setTimeout(
				() => setAttributionText(document.getElementsByClassName("mapboxgl-ctrl-attrib-inner")[0].innerHTML),
				3000
			);
		},
		[
			onShowGridLoader,
			onShowGrabDisclaimerModal,
			currentMapProvider,
			switchToDefaultRegionStack,
			resetAwsStore,
			setMapProvider,
			setMapStyle,
			resetAppState,
			setAttributionText
		]
	);

	const onChangeStyle = (id: EsriMapEnum | HereMapEnum | GrabMapEnum) => {
		if (id !== currentMapStyle) {
			onShowGridLoader();
			setMapStyle(id);
		}
	};

	return (
		<>
			<Flex data-testid="map-buttons-container" className="map-styles-and-geofence-container">
				<Flex
					data-testid="map-styles-button"
					ref={stylesCardTogglerRef}
					className={openStylesCard ? "map-styles-button active" : "map-styles-button"}
					onClick={toggleMapStyles}
					data-tooltip-id="map-styles-button"
					data-tooltip-place="left"
					data-tooltip-content="Map provider and styles"
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
					data-tooltip-content="Geofence"
				>
					<IconGeofencePlusSolid />
				</Flex>
				<Tooltip id="geofence-control-button" />
			</Flex>
			{openStylesCard && (
				<Card data-testid="map-styles-card" ref={stylesCardRef} className="map-styles-card">
					<View className="triangle-pointer" />
					<Flex className="map-styles-header">
						<TextEl margin="1.23rem 0rem" fontFamily="AmazonEmber-Bold" fontSize="1.23rem" text="Map style" />
						<Flex className="map-styles-icon-close-container" onClick={() => setOpenStylesCard(false)}>
							<IconClose />
						</Flex>
					</Flex>
					<Flex className="ms-info-container">
						<IconInfoSolid />
						<TextEl
							variation="tertiary"
							text={"Changing data provider also affects\nPaces & Routes API"}
							whiteSpace="pre-line"
						/>
					</Flex>
					<Flex gap={0} direction="column">
						{/* Esri */}
						<Flex
							data-testid="map-data-provider-esri"
							className={
								currentMapProvider === ESRI ? "map-data-provider selected-map-data-provider" : "map-data-provider"
							}
							onClick={() => onMapProviderChange(ESRI)}
						>
							<TextEl fontSize="1.23rem" lineHeight="2.15rem" text={ESRI} />
							<Radio
								data-testid="map-provider-radio-button-esri"
								value={ESRI}
								checked={currentMapProvider === ESRI}
								onChange={e => {
									e.preventDefault();
									e.stopPropagation();
									onMapProviderChange(ESRI);
								}}
							/>
						</Flex>
						{currentMapProvider !== ESRI && <Divider className="mb-divider" />}
						{currentMapProvider === ESRI && (
							<Flex data-testid="esri-map-styles" gap={0} padding="0rem 1.23rem 1.23rem 1.23rem" wrap="wrap">
								{ESRI_STYLES.map(({ id, image, name }) => (
									<Flex
										data-testid="map-style-item"
										key={id}
										className={id === currentMapStyle ? "mb-style-container selected" : "mb-style-container"}
										onClick={() => onChangeStyle(id)}
									>
										<Flex gap={0} position="relative">
											{isLoadingImg && <Placeholder position="absolute" width="82px" height="82px" />}
											<img src={image} alt={name} onLoad={() => setIsLoadingImg(false)} />
										</Flex>
										<TextEl marginTop="0.62rem" text={name} />
									</Flex>
								))}
							</Flex>
						)}
						{/* HERE */}
						{currentMapProvider === ESRI && <Divider className="mb-divider" />}
						<Flex
							data-testid="map-data-provider-here"
							className={
								currentMapProvider === HERE ? "map-data-provider selected-map-data-provider" : "map-data-provider"
							}
							onClick={() => onMapProviderChange(HERE)}
						>
							<TextEl fontSize="1.23rem" lineHeight="2.15rem" text={HERE} />
							<Radio
								data-testid="map-provider-radio-button-here"
								value={HERE}
								checked={currentMapProvider === HERE}
								onChange={e => {
									e.preventDefault();
									e.stopPropagation();
									onMapProviderChange(HERE);
								}}
							/>
						</Flex>
						{currentMapProvider !== HERE && <Divider className="mb-divider" />}
						{currentMapProvider === HERE && (
							<Flex data-testid="here-map-styles" gap={0} padding="0rem 1.23rem 1.23rem 1.23rem" wrap="wrap">
								{HERE_STYLES.map(({ id, image, name }) => (
									<Flex
										key={id}
										className={id === currentMapStyle ? "mb-style-container selected" : "mb-style-container"}
										onClick={() => onChangeStyle(id)}
									>
										<Flex gap={0} position="relative">
											{isLoadingImg && <Placeholder position="absolute" width="82px" height="82px" />}
											<img src={image} alt={name} onLoad={() => setIsLoadingImg(false)} />
										</Flex>
										<TextEl marginTop="0.62rem" text={name} />
									</Flex>
								))}
							</Flex>
						)}
						{/* Grab */}
						{isGrabVisible && (
							<>
								{currentMapProvider === HERE && <Divider className="mb-divider" />}
								<Flex
									data-testid="map-data-provider-grab"
									className={
										currentMapProvider === GRAB ? "map-data-provider selected-map-data-provider" : "map-data-provider"
									}
									onClick={() => onMapProviderChange(GRAB)}
								>
									<TextEl fontSize="1.23rem" lineHeight="2.15rem" text={GRAB} />
									<Radio
										data-testid="map-provider-radio-button-grab"
										value={GRAB}
										checked={currentMapProvider === GRAB}
										onChange={e => {
											e.preventDefault();
											e.stopPropagation();
											onMapProviderChange(GRAB);
										}}
									/>
								</Flex>
								{currentMapProvider === GRAB && (
									<Flex data-testid="grab-map-styles" gap={0} padding="0rem 1.23rem 1.23rem 1.23rem" wrap="wrap">
										{GRAB_STYLES.map(({ id, image, name }) => (
											<Flex
												key={id}
												className={id === currentMapStyle ? "mb-style-container selected" : "mb-style-container"}
												onClick={() => onChangeStyle(id)}
											>
												<Flex gap={0} position="relative">
													{isLoadingImg && <Placeholder position="absolute" width="82px" height="82px" />}
													<img src={image} alt={name} onLoad={() => setIsLoadingImg(false)} />
												</Flex>
												<TextEl marginTop="0.62rem" text={name} />
											</Flex>
										))}
									</Flex>
								)}
							</>
						)}
					</Flex>
				</Card>
			)}
		</>
	);
};

export default MapButtons;

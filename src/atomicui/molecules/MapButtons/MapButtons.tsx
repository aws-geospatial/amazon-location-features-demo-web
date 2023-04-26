/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Card, Divider, Flex, Placeholder, Radio, View } from "@aws-amplify/ui-react";
import { IconClose, IconGeofencePlusSolid, IconInfoSolid, IconMapSolid } from "@demo/assets";
import { TextEl } from "@demo/atomicui/atoms";
import appConfig from "@demo/core/constants/appConfig";
import { useAmplifyAuth, useAmplifyMap, useAwsGeofence } from "@demo/hooks";
import { EsriMapEnum, HereMapEnum, MapProviderEnum } from "@demo/types";
import { Tooltip } from "react-tooltip";

import "./styles.scss";

interface MapButtonsProps {
	openStylesCard: boolean;
	setOpenStylesCard: (b: boolean) => void;
	onCloseSidebar: () => void;
	onOpenConnectAwsAccountModal: () => void;
	onOpenSignInModal: () => void;
	onShowGeofenceBox: () => void;
	resetAppState: () => void;
}

const { ESRI_STYLES, HERE_STYLES } = appConfig;
const { ESRI, HERE } = MapProviderEnum;

const MapButtons: React.FC<MapButtonsProps> = ({
	openStylesCard,
	setOpenStylesCard,
	onCloseSidebar,
	onOpenConnectAwsAccountModal,
	onOpenSignInModal,
	onShowGeofenceBox,
	resetAppState
}) => {
	const [isLoadingImg, setIsLoadingImg] = useState(true);
	const stylesCardRef = useRef<HTMLDivElement | null>(null);
	const stylesCardTogglerRef = useRef<HTMLDivElement | null>(null);
	const { credentials, isUserAwsAccountConnected } = useAmplifyAuth();
	const {
		mapProvider: currentMapProvider,
		setMapProvider,
		mapStyle: currentMapStyle,
		setMapStyle,
		setAttributionText
	} = useAmplifyMap();
	const { isAddingGeofence, setIsAddingGeofence } = useAwsGeofence();
	const isAuthenticated = !!credentials?.authenticated;

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
			setIsLoadingImg(true);
			setMapProvider(mapProvider === ESRI ? ESRI : HERE);
			setMapStyle(mapProvider === ESRI ? EsriMapEnum.ESRI_LIGHT : HereMapEnum.HERE_EXPLORE);
			resetAppState();
			setTimeout(
				() => setAttributionText(document.getElementsByClassName("mapboxgl-ctrl-attrib-inner")[0].innerHTML),
				3000
			);
		},
		[setMapProvider, setMapStyle, resetAppState, setAttributionText]
	);

	const onChangeStyle = (id: EsriMapEnum | HereMapEnum) => {
		if (id !== currentMapStyle) {
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
						<Flex gap={0} padding="0.77rem 1.23rem" justifyContent="space-between" width="100%">
							<TextEl fontSize="1.23rem" lineHeight="2.15rem" text="Esri" />
							<Radio
								data-testid="map-provider-radio-button-esri"
								value={ESRI}
								checked={currentMapProvider === ESRI}
								onChange={() => onMapProviderChange(ESRI)}
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
											<img src={image} onLoad={() => setIsLoadingImg(false)} />
										</Flex>
										<TextEl marginTop="0.62rem" text={name} />
									</Flex>
								))}
							</Flex>
						)}
						{currentMapProvider === ESRI && <Divider className="mb-divider" />}
						<Flex gap={0} padding="0.77rem 1.23rem" justifyContent="space-between" width="100%">
							<TextEl fontSize="1.23rem" lineHeight="2.15rem" text="HERE" />
							<Radio
								data-testid="map-provider-radio-button-here"
								value={HERE}
								checked={currentMapProvider === HERE}
								onChange={() => onMapProviderChange(HERE)}
							/>
						</Flex>
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
											<img src={image} alt={"FISH"} onLoad={() => setIsLoadingImg(false)} />
										</Flex>
										<TextEl marginTop="0.62rem" text={name} />
									</Flex>
								))}
							</Flex>
						)}
					</Flex>
				</Card>
			)}
		</>
	);
};

export default MapButtons;

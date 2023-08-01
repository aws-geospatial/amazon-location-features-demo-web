/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button, Flex, Placeholder, Text, View } from "@aws-amplify/ui-react";
import { IconCar, IconClose, IconCopyPages, IconDirections, IconInfo } from "@demo/assets";
import { useAmplifyMap, useAwsPlace, useAwsRoute, useMediaQuery } from "@demo/hooks";
import { DistanceUnitEnum, MapProviderEnum, MapUnitEnum, SuggestionType, TravelMode } from "@demo/types";

import { TriggeredByEnum } from "@demo/types/Enums";
import { humanReadableTime } from "@demo/utils/dateTimeUtils";
import { calculateGeodesicDistance } from "@demo/utils/geoCalculation";
import { Units } from "@turf/turf";
import { CalculateRouteRequest, CalculateRouteResponse, Position } from "aws-sdk/clients/location";
import { useTranslation } from "react-i18next";
import { Popup as PopupGl } from "react-map-gl";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { METRIC } = MapUnitEnum;
const { KILOMETERS, KILOMETERS_SHORT, MILES, MILES_SHORT } = DistanceUnitEnum;

interface Props {
	active: boolean;
	info: SuggestionType;
	select: (id?: string) => Promise<void>;
	onClosePopUp?: () => void;
}
const Popup: React.FC<Props> = ({ active, info, select, onClosePopUp }) => {
	const [routeData, setRouteData] = useState<CalculateRouteResponse>();
	const {
		currentLocationData,
		viewpoint,
		mapProvider: currentMapProvider,
		mapUnit: currentMapUnit,
		isCurrentLocationDisabled
	} = useAmplifyMap();
	const { clearPoiList } = useAwsPlace();
	const { getRoute, setDirections, isFetchingRoute } = useAwsRoute();
	const [longitude, latitude] = info.Place?.Geometry.Point as Position;
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const { t, i18n } = useTranslation();
	const currentLang = i18n.language;
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";

	const geodesicDistance = useMemo(
		() =>
			calculateGeodesicDistance(
				currentLocationData?.currentLocation && !isCurrentLocationDisabled
					? [
							currentLocationData.currentLocation.longitude as number,
							currentLocationData.currentLocation.latitude as number
					  ]
					: [viewpoint.longitude, viewpoint.latitude],
				[longitude, latitude],
				currentMapUnit === METRIC ? (KILOMETERS.toLowerCase() as Units) : (MILES.toLowerCase() as Units)
			),
		[isCurrentLocationDisabled, viewpoint, currentLocationData, longitude, latitude, currentMapUnit]
	);

	const localizeGeodesicDistance = useMemo(() => {
		const formatter = new Intl.NumberFormat(currentLang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		return formatter.format(geodesicDistance || 0);
	}, [geodesicDistance, currentLang]);

	const geodesicDistanceWithUnit = useMemo(
		() =>
			localizeGeodesicDistance
				? currentMapUnit === METRIC
					? `${localizeGeodesicDistance} ${KILOMETERS_SHORT}`
					: `${localizeGeodesicDistance} ${MILES_SHORT}`
				: "",
		[localizeGeodesicDistance, currentMapUnit]
	);

	/* Esri route can't be calculated when distance is greater than 400 km or 248.55 mi */
	const isEsriLimitation = useMemo(() => {
		if (geodesicDistance) {
			const maxDistance = currentMapUnit === METRIC ? 400 : 248.55;
			return currentMapProvider === MapProviderEnum.ESRI && geodesicDistance >= maxDistance;
		} else {
			return false;
		}
	}, [geodesicDistance, currentMapUnit, currentMapProvider]);

	const loadRouteData = useCallback(async () => {
		const params: Omit<CalculateRouteRequest, "CalculatorName" | "DepartNow"> = {
			DeparturePosition: [
				currentLocationData?.currentLocation?.longitude,
				currentLocationData?.currentLocation?.latitude
			] as Position,
			DestinationPosition: [longitude, latitude],
			DistanceUnit: currentMapUnit === METRIC ? KILOMETERS : MILES,
			TravelMode: TravelMode.CAR
		};
		const r = await getRoute(params as CalculateRouteRequest, TriggeredByEnum.PLACES_POPUP);
		setRouteData(r);
	}, [currentLocationData, longitude, latitude, currentMapUnit, getRoute]);

	useEffect(() => {
		if (
			!routeData &&
			active &&
			!isEsriLimitation &&
			!!currentLocationData?.currentLocation &&
			!isCurrentLocationDisabled
		) {
			loadRouteData();
		}
	}, [routeData, active, isEsriLimitation, currentLocationData, isCurrentLocationDisabled, loadRouteData]);

	const onClose = useCallback(async () => {
		await select(undefined);
		onClosePopUp && onClosePopUp();
	}, [select, onClosePopUp]);

	const onGetDirections = () => {
		setDirections({ info, isEsriLimitation });
		onClose();
		clearPoiList();
	};

	const renderRouteInfo = useMemo(() => {
		if (currentLocationData?.error || isCurrentLocationDisabled) {
			return (
				<Flex data-testid="permission-denied-error-container" gap={3} alignItems="center">
					<Text variation="info" textAlign={isLtr ? "start" : "end"}>
						{isCurrentLocationDisabled ? t("popup__cl_disabled.text") : t("popup__cl_denied.text")}
					</Text>
					<IconInfo
						className="location-permission-denied-info-icon"
						data-tooltip-id="location-permission-denied-info"
						data-tooltip-place="top"
						data-tooltip-content={isCurrentLocationDisabled ? t("tooltip__cl_grab.text") : t("tooltip__cl_denied.text")}
					/>
					<Tooltip id="location-permission-denied-info" />
				</Flex>
			);
		} else if (isEsriLimitation) {
			return (
				<Flex data-testid="esri-limitation-message-container" gap={0} direction={"column"}>
					<Text className="bold" variation="secondary">
						{geodesicDistanceWithUnit}
					</Text>
					<Text style={{ marginTop: "0px" }} variation="info" textAlign={isLtr ? "start" : "end"}>
						{currentMapUnit === METRIC ? t("popup__esri_limitation_1.text") : t("popup__esri_limitation_2.text")}
					</Text>
				</Flex>
			);
		} else if (!isFetchingRoute && !routeData) {
			return (
				<Flex data-testid="here-message-container" gap={0} direction={"column"}>
					<Text className="bold" variation="secondary">
						{geodesicDistanceWithUnit}
					</Text>
					<Text style={{ marginTop: "0px" }} variation="info">
						{t("popup__route_not_found.text")}
					</Text>
				</Flex>
			);
		} else {
			const timeInSeconds = routeData?.Summary.DurationSeconds || 0;

			return (
				<View data-testid="route-info-container" className="route-info">
					{!isFetchingRoute && geodesicDistanceWithUnit ? (
						<Text className="bold" variation="secondary">
							{geodesicDistanceWithUnit}
						</Text>
					) : (
						<Placeholder width={30} display="inline-block" />
					)}
					<View />
					<IconCar />
					{!isFetchingRoute && timeInSeconds ? (
						<Text className="bold" variation="secondary">
							{humanReadableTime(timeInSeconds * 1000, currentLang)}
						</Text>
					) : (
						<Placeholder width={30} display="inline-block" />
					)}
				</View>
			);
		}
	}, [
		currentLocationData,
		isCurrentLocationDisabled,
		geodesicDistanceWithUnit,
		currentMapUnit,
		isEsriLimitation,
		routeData,
		isFetchingRoute,
		t,
		isLtr,
		currentLang
	]);

	const address = useMemo(() => {
		if (info.Place?.Label) {
			const split = info.Place.Label.split(",");
			split.shift();
			return split.join(",").trim();
		} else {
			return `${latitude}, ${longitude}`;
		}
	}, [info, latitude, longitude]);

	return (
		<PopupGl
			data-testid="popup-container"
			className="popup-container"
			closeButton={false}
			anchor={isDesktop ? "left" : "bottom"}
			offset={active ? 27 : 22}
			style={{ maxWidth: isDesktop ? "28.62rem" : "20rem", width: "100%" }}
			longitude={longitude as number}
			latitude={latitude as number}
		>
			<View className="popup-icon-close-container" onClick={onClose}>
				<IconClose />
			</View>
			{isDesktop && (
				<View className="triangle-container">
					<View />
				</View>
			)}
			<View className="info-container">
				<Text className="bold" variation="secondary" fontSize="20px" lineHeight="28px">{`${
					info.Place?.Label?.split(",")[0]
				}`}</Text>
				<View className="address-container">
					<View>
						<Text variation="tertiary">{address}</Text>
					</View>
					<IconCopyPages
						data-testid="copy-icon"
						className="copy-icon"
						onClick={() => navigator.clipboard.writeText(`${info.Place?.Label?.split(",")[0]}` + ", " + address)}
					/>
				</View>
				{renderRouteInfo}
				<Button
					data-testid="directions-button"
					ref={r => r?.blur()}
					className="directions-button"
					variation="primary"
					onClick={onGetDirections}
				>
					<IconDirections />
					<Text className="bold" variation="primary" fontSize={"0.92rem"}>
						{t("popup__directions.text")}
					</Text>
				</Button>
			</View>
		</PopupGl>
	);
};

export default Popup;

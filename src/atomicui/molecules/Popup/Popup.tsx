/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button, Flex, Placeholder, Text, View } from "@aws-amplify/ui-react";
import { IconCar, IconClose, IconCopyPages, IconDirections, IconInfo } from "@demo/assets";
import { TextEl } from "@demo/atomicui/atoms";
import { useAmplifyMap, useAwsPlace, useAwsRoute, useMediaQuery } from "@demo/hooks";
import { DistanceUnitEnum, MapProviderEnum, MapUnitEnum, SuggestionType } from "@demo/types";

import { humanReadableTime } from "@demo/utils/dateTimeUtils";
import { calculateGeodesicDistance } from "@demo/utils/geoCalculation";
import { Units } from "@turf/turf";
import { CalculateRouteRequest, CalculateRouteResponse, Position } from "aws-sdk/clients/location";
import { Popup as PopupGl } from "react-map-gl";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { METRIC } = MapUnitEnum;
const { KILOMETERS, KILOMETERS_SHORT, METERS_SHORT, MILES, MILES_SHORT, FEET_SHORT } = DistanceUnitEnum;

interface Props {
	active: boolean;
	info: SuggestionType;
	select: (id?: string) => Promise<void>;
	onClosePopUp?: () => void;
}
const Popup: React.FC<Props> = ({ active, info, select, onClosePopUp }) => {
	const [routeData, setRouteData] = useState<CalculateRouteResponse>();
	const { currentLocationData, mapProvider: currentMapProvider, mapUnit: currentMapUnit } = useAmplifyMap();
	const { clearPoiList } = useAwsPlace();
	const { getRoute, setDirections, isFetchingRoute } = useAwsRoute();
	const [longitude, latitude] = info.Place?.Geometry.Point as Position;
	const isDesktop = useMediaQuery("(min-width: 1024px)");

	const geodesicDistance = useMemo(
		() =>
			calculateGeodesicDistance(
				[
					currentLocationData?.currentLocation?.longitude as number,
					currentLocationData?.currentLocation?.latitude as number
				],
				[longitude, latitude],
				currentMapUnit === METRIC ? (KILOMETERS.toLowerCase() as Units) : (MILES.toLowerCase() as Units)
			),
		[currentLocationData, longitude, latitude, currentMapUnit]
	);

	const geodesicDistanceWithUnit = useMemo(
		() =>
			geodesicDistance
				? currentMapUnit === METRIC
					? geodesicDistance < 1
						? `${geodesicDistance * 1000} ${METERS_SHORT}`
						: `${geodesicDistance.toFixed(2)} ${KILOMETERS_SHORT}`
					: geodesicDistance < 1
					? `${parseInt((geodesicDistance * 5280).toString())} ${FEET_SHORT}`
					: `${geodesicDistance.toFixed(2)} ${MILES_SHORT}`
				: "",
		[geodesicDistance, currentMapUnit]
	);

	/* Esri route can't be calculated when distance is greater than 400 km or 248.55 mi */
	const isEsriLimitation = useMemo(() => {
		if (geodesicDistance) {
			const maxDistance = currentMapUnit === METRIC ? 400 : 248.55;
			return currentMapProvider === MapProviderEnum.ESRI && geodesicDistance >= maxDistance;
		} else {
			return true;
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
			TravelMode: "Car"
		};
		const r = await getRoute(params as CalculateRouteRequest);
		setRouteData(r);
	}, [currentLocationData, longitude, latitude, currentMapUnit, getRoute]);

	useEffect(() => {
		if (!routeData && active && !isEsriLimitation) {
			loadRouteData();
		}
	}, [routeData, active, isEsriLimitation, loadRouteData]);

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
		if (currentLocationData?.error) {
			return (
				<Flex data-testid="permission-denied-error-container" gap={3} alignItems="center">
					<TextEl variation="info" text="Location permission denied" />
					<IconInfo
						className="location-permission-denied-info-icon"
						data-tooltip-id="location-permission-denied-info"
						data-tooltip-place="top"
						data-tooltip-content="Distance can't be calculate if location permission is not granted, kindly grant access to location from the URL bar or browser settings"
					/>
					<Tooltip id="location-permission-denied-info" />
				</Flex>
			);
		} else if (isEsriLimitation) {
			return (
				<Flex data-testid="esri-limitation-message-container" gap={0} direction={"column"}>
					<TextEl variation="secondary" fontFamily="AmazonEmber-Bold" text={geodesicDistanceWithUnit} />
					<TextEl
						style={{ marginTop: "0px" }}
						variation="info"
						text={`Distance is greater than ${
							currentMapUnit === METRIC ? "400 km" : "248.55 mi"
						}, can't calculate via Esri, kindly switch to HERE provider`}
					/>
				</Flex>
			);
		} else if (currentMapProvider === MapProviderEnum.HERE && !routeData) {
			return (
				<Flex data-testid="here-message-container" gap={0} direction={"column"}>
					<TextEl variation="secondary" fontFamily="AmazonEmber-Bold" text={geodesicDistanceWithUnit} />
					<TextEl style={{ marginTop: "0px" }} variation="info" text="Route not found" />
				</Flex>
			);
		} else {
			const timeInSeconds = routeData?.Summary.DurationSeconds || 0;

			return (
				<View data-testid="route-info-container" className="route-info">
					{!isFetchingRoute && geodesicDistanceWithUnit ? (
						<TextEl variation="secondary" fontFamily="AmazonEmber-Bold" text={geodesicDistanceWithUnit} />
					) : (
						<Placeholder width={30} display="inline-block" />
					)}
					<View />
					<IconCar />
					{!isFetchingRoute && timeInSeconds ? (
						<TextEl
							variation="secondary"
							fontFamily="AmazonEmber-Bold"
							text={humanReadableTime(timeInSeconds * 1000)}
						/>
					) : (
						<Placeholder width={30} display="inline-block" />
					)}
				</View>
			);
		}
	}, [
		currentLocationData,
		geodesicDistanceWithUnit,
		currentMapUnit,
		isEsriLimitation,
		currentMapProvider,
		routeData,
		isFetchingRoute
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
				<TextEl
					variation="secondary"
					fontFamily="AmazonEmber-Bold"
					fontSize="20px"
					lineHeight="28px"
					text={`${info.Place?.Label?.split(",")[0]}`}
				/>
				<View className="address-container">
					<View>
						<TextEl variation="tertiary" text={address} />
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
						Directions
					</Text>
				</Button>
			</View>
		</PopupGl>
	);
};

export default Popup;

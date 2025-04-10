/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, Flex, Link, Placeholder, Text, View } from "@aws-amplify/ui-react";
import { GetPlaceCommandOutput } from "@aws-sdk/client-geo-places";
import { CalculateRoutesCommandInput, CalculateRoutesCommandOutput } from "@aws-sdk/client-geo-routes";
import {
	IconArrow,
	IconCar,
	IconClock,
	IconClose,
	IconCopyPages,
	IconDirections,
	IconGlobe,
	IconInfo,
	IconPhone
} from "@demo/assets/svgs";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useMap, usePlace, useRoute } from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { DistanceUnitEnum, MapUnitEnum, TravelMode } from "@demo/types";
import { ResponsiveUIEnum, TriggeredByEnum } from "@demo/types/Enums";
import { uuid } from "@demo/utils";
import { humanReadableTime } from "@demo/utils/dateTimeUtils";
import { calculateGeodesicDistance } from "@demo/utils/geoCalculation";
import { Units } from "@turf/turf";
import { useTranslation } from "react-i18next";
import { Popup as PopupGl } from "react-map-gl/maplibre";
import { Tooltip } from "react-tooltip";
import "./styles.scss";

const { METRIC } = MapUnitEnum;
const { KILOMETERS, MILES } = DistanceUnitEnum;

interface PopupProps {
	placeId: string;
	position: number[];
	label?: string;
	active: boolean;
	select: (id?: string) => Promise<void>;
	onClosePopUp?: () => void;
}
const Popup: FC<PopupProps> = ({ placeId, position, label, active, select, onClosePopUp }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [routeData, setRouteData] = useState<CalculateRoutesCommandOutput>();
	const [placeData, setPlaceData] = useState<GetPlaceCommandOutput | undefined>(undefined);
	const [isExpanded, setIsExpanded] = useState(false);
	const { setPOICard, setBottomSheetMinHeight, setBottomSheetHeight, setUI, bottomSheetHeight, ui } = useBottomSheet();
	const { currentLocationData, viewpoint, mapUnit } = useMap();
	const { getPlaceData, isFetchingPlaceData, clearPoiList } = usePlace();
	const { getRoute, setDirections, isFetchingRoute } = useRoute();
	const { isDesktop } = useDeviceMediaQuery();
	const { t, i18n } = useTranslation();
	const currentLang = i18n.language;
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const isLanguageRTL = ["ar", "he"].includes(currentLang);
	const POICardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		(async () => {
			if (!placeData) {
				const pd = await getPlaceData(placeId);
				setPlaceData(pd);
			}
		})();
	}, [placeData, getPlaceData, placeId]);

	const geodesicDistance = useMemo(
		() =>
			calculateGeodesicDistance(
				currentLocationData?.currentLocation
					? [
							currentLocationData.currentLocation.longitude as number,
							currentLocationData.currentLocation.latitude as number
					  ]
					: [viewpoint.longitude, viewpoint.latitude],
				position,
				mapUnit === METRIC ? (KILOMETERS.toLowerCase() as Units) : (MILES.toLowerCase() as Units)
			),
		[viewpoint, currentLocationData, position, mapUnit]
	);

	const localizeGeodesicDistance = useMemo(() => {
		const formatter = new Intl.NumberFormat(currentLang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		return formatter.format(geodesicDistance || 0).replace(/\s/g, "");
	}, [geodesicDistance, currentLang]);

	const geodesicDistanceUnit = useMemo(
		() =>
			localizeGeodesicDistance
				? mapUnit === METRIC
					? t("geofence_box__km__short.text")
					: t("geofence_box__mi__short.text")
				: "",
		[localizeGeodesicDistance, mapUnit, t]
	);

	useEffect(() => {
		if (
			!routeData &&
			active &&
			!!currentLocationData?.currentLocation &&
			geodesicDistance &&
			geodesicDistance <= 2000
		) {
			(async () => {
				const params: CalculateRoutesCommandInput = {
					Origin: [
						currentLocationData?.currentLocation?.longitude,
						currentLocationData?.currentLocation?.latitude
					] as number[],
					Destination: position,
					TravelMode: TravelMode.CAR
				};
				try {
					setIsLoading(true);
					const r = await getRoute(params, TriggeredByEnum.PLACES_POPUP);
					setRouteData(r);
				} finally {
					setIsLoading(false);
				}
			})();
		}
	}, [active, currentLocationData, geodesicDistance, getRoute, position, routeData]);

	const onClose = useCallback(
		async (ui: ResponsiveUIEnum) => {
			if (!isDesktop) {
				setPOICard(undefined);
				setUI(ui);
				setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
				setBottomSheetHeight(window.innerHeight * 0.4);
				setTimeout(() => {
					setBottomSheetMinHeight(BottomSheetHeights.explore.min);
					setBottomSheetHeight(window.innerHeight);
				}, 500);
			}

			await select(undefined);
			onClosePopUp && onClosePopUp();
		},
		[isDesktop, select, onClosePopUp, setPOICard, setUI, setBottomSheetMinHeight, setBottomSheetHeight]
	);

	const onGetDirections = useCallback(() => {
		setDirections({
			id: uuid.randomUUID(),
			placeId,
			position,
			label,
			address: placeData?.Address
		});
		clearPoiList();

		if (!isDesktop) {
			onClose(ResponsiveUIEnum.direction_to_routes);
		}
	}, [clearPoiList, isDesktop, label, onClose, placeData, placeId, position, setDirections]);

	const address = useMemo(() => {
		if (label) {
			const split = label.split(",");
			split.shift();
			return split.join(",").trim();
		} else {
			return `${position[1]}, ${position[0]}`;
		}
	}, [label, position]);

	const renderRouteInfo = useMemo(() => {
		if (currentLocationData?.error) {
			return (
				<Flex data-testid="permission-denied-error-container" gap={3} alignItems="center">
					<Text variation="info" textAlign={isLtr ? "start" : "end"}>
						{t("popup__cl_denied.text")}
					</Text>
					<IconInfo
						className="location-permission-denied-info-icon"
						data-tooltip-id="location-permission-denied-info"
						data-tooltip-place="top"
						data-tooltip-content={t("tooltip__cl_denied.text")}
					/>
					<Tooltip id="location-permission-denied-info" />
				</Flex>
			);
		} else if (!isFetchingRoute && !routeData) {
			return (
				<Flex data-testid="here-message-container" gap="0" direction={"column"}>
					<Flex className="localize-geofence-distance" gap="0.3rem" direction={isLanguageRTL ? "row-reverse" : "row"}>
						<Text className="bold" variation="secondary" marginRight="0.3rem">
							{localizeGeodesicDistance}
						</Text>
						<Text className="bold" variation="secondary">
							{geodesicDistanceUnit}
						</Text>
						{!isLoading && <></>}
					</Flex>
					<Text style={{ marginTop: "0px" }} variation="info">
						{!isLoading && t("popup__route_not_found.text")}
					</Text>
				</Flex>
			);
		} else {
			const timeInSeconds = routeData?.Routes?.reduce((acc, route) => acc + route.Summary!.Duration!, 0);

			return (
				<View data-testid="route-info-container" className="route-info">
					{!isFetchingRoute && geodesicDistanceUnit ? (
						<Flex className="localize-geofence-distance" gap="0.3rem" direction={isLanguageRTL ? "row-reverse" : "row"}>
							<Text className="bold" variation="secondary">
								{localizeGeodesicDistance}
							</Text>
							<Text className="bold" variation="secondary">
								{geodesicDistanceUnit}
							</Text>
						</Flex>
					) : (
						<Placeholder width={30} display="inline-block" />
					)}
					<View />
					<IconCar />
					{!isFetchingRoute && timeInSeconds ? (
						<Text className="bold" variation="secondary">
							{humanReadableTime(timeInSeconds * 1000, currentLang, t)}
						</Text>
					) : (
						<Placeholder width={30} display="inline-block" />
					)}
				</View>
			);
		}
	}, [
		currentLang,
		currentLocationData?.error,
		geodesicDistanceUnit,
		isFetchingRoute,
		isLanguageRTL,
		isLoading,
		isLtr,
		localizeGeodesicDistance,
		routeData,
		t
	]);

	const renderPlaceInfo = useMemo(() => {
		const openingHours: string[] = [];
		placeData?.OpeningHours?.forEach(oh => oh.Display?.forEach(d => openingHours.push(d)));
		const areOpeningHoursPresent = openingHours.length > 0 && openingHours.every(oh => oh !== undefined);
		const websites = placeData?.Contacts?.Websites?.map(w => w.Value);
		const areWebsitesPresent = websites && websites.every(w => w !== undefined);
		const phones = placeData?.Contacts?.Phones?.map(p => p.Value);
		const arePhonesPresent = phones && phones.every(p => p !== undefined);
		const renderNull = !areOpeningHoursPresent && !areWebsitesPresent && !arePhonesPresent;

		return isFetchingPlaceData ? (
			<Flex className="place-info-container">
				<Flex className="opening-hours">
					<Flex className="accordion-header">
						<Placeholder width="1.23rem" height="1.23rem" marginRight="0.62rem" />
						<Placeholder />
					</Flex>
				</Flex>
				<Flex className="website">
					<Placeholder width="1.23rem" height="1.23rem" marginRight="0.62rem" />
					<Placeholder />
				</Flex>
				<Flex className="phone" marginLeft={0}>
					<Placeholder width="1.23rem" height="1.23rem" marginRight="0.62rem" />
					<Placeholder />
				</Flex>
			</Flex>
		) : renderNull ? null : (
			<Flex className="place-info-container">
				{areOpeningHoursPresent && (
					<Flex className="opening-hours">
						<Flex className="accordion-header" onClick={() => setIsExpanded(!isExpanded)}>
							<IconClock className="icon" />
							<Text className="regular small-text" lineHeight="1.38rem" color="var(--tertiary-color)">
								Schedule
							</Text>
							<Flex className="spacer" />
							<IconArrow className={`icon-arrow${isExpanded ? " transform" : ""}`} />
						</Flex>
						{isExpanded && (
							<Flex className="accordion-content">
								{openingHours.map((oh, idx) => (
									<Text key={idx} className="regular small-text" lineHeight="1.38rem">
										{oh}
									</Text>
								))}
							</Flex>
						)}
					</Flex>
				)}
				{areWebsitesPresent && (
					<Flex className="website">
						<IconGlobe className="icon" style={{ marginTop: "0.2rem" }} />
						<Flex className="urls">
							{websites.map((w, idx) => (
								<Link key={idx} href={w} target="_blank">
									<Text className="regular small-text link-text" lineHeight="1.38rem" color="var(--primary-color)">
										{w}
									</Text>
								</Link>
							))}
						</Flex>
					</Flex>
				)}
				{arePhonesPresent && (
					<Flex className="phone">
						<IconPhone className="icon" style={{ marginTop: "0.12rem" }} />
						<Flex className="numbers">
							{phones.map((p, idx) => (
								<Text key={idx} className="regular small-text" lineHeight="1.38rem">
									{p}
								</Text>
							))}
						</Flex>
					</Flex>
				)}
			</Flex>
		);
	}, [isExpanded, isFetchingPlaceData, placeData]);

	const POIBody = useCallback(
		() => (
			<Flex
				data-testid="poi-body"
				ref={POICardRef}
				className={!isDesktop ? "poi-only-container" : ""}
				direction="column"
			>
				<View className="popup-icon-close-container">
					<IconClose onClick={() => onClose(ResponsiveUIEnum.search)} />
				</View>
				{isDesktop && (
					<View className="triangle-container">
						<View />
					</View>
				)}
				<View className="info-container">
					<Text className="bold" variation="secondary" fontSize="20px" lineHeight="28px">{`${
						label?.split(",")[0]
					}`}</Text>
					<View className="address-container">
						<View>
							<Text variation="tertiary">{address}</Text>
						</View>
						{isDesktop && (
							<IconCopyPages
								data-testid="copy-icon"
								className="copy-icon"
								onClick={() => navigator.clipboard.writeText(`${label?.split(",")[0]}` + ", " + address)}
							/>
						)}
					</View>
					{renderRouteInfo}
					{renderPlaceInfo}
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
			</Flex>
		),
		[isDesktop, label, address, renderRouteInfo, renderPlaceInfo, onGetDirections, t, onClose]
	);

	useEffect(() => {
		if (!isDesktop) {
			const ch = POICardRef?.current?.clientHeight || 140;
			ui !== ResponsiveUIEnum.poi_card && setUI(ResponsiveUIEnum.poi_card);
			setPOICard(<POIBody />);
			setBottomSheetMinHeight(ch + 60);
			setBottomSheetHeight(ch + 70);
		}
	}, [
		POIBody,
		position,
		isDesktop,
		setBottomSheetHeight,
		setBottomSheetMinHeight,
		setPOICard,
		setUI,
		bottomSheetHeight,
		ui
	]);

	if (isDesktop) {
		return (
			<PopupGl
				data-testid="popup-container"
				className="popup-container"
				closeButton={false}
				anchor={isDesktop ? "left" : "bottom"}
				offset={active ? 27 : 22}
				style={{ maxWidth: isDesktop ? "28.62rem" : "20rem", width: "100%" }}
				longitude={position[0]}
				latitude={position[1]}
			>
				<POIBody />
			</PopupGl>
		);
	} else {
		return null;
	}
};

export default memo(Popup);

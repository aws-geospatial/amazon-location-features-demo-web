/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, Flex, Placeholder, Text, View } from "@aws-amplify/ui-react";
import { CalculateRoutesCommandInput, CalculateRoutesCommandOutput } from "@aws-sdk/client-geo-routes";
import { IconCar, IconClose, IconCopyPages, IconDirections, IconInfo } from "@demo/assets/svgs";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useMap, usePlace, useRoute } from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { DistanceUnitEnum, MapUnitEnum, SuggestionType, TravelMode } from "@demo/types";
import { ResponsiveUIEnum, TriggeredByEnum } from "@demo/types/Enums";
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
	active: boolean;
	info: SuggestionType;
	select: (id?: string) => Promise<void>;
	onClosePopUp?: () => void;
}
const Popup: FC<PopupProps> = ({ active, info, select, onClosePopUp }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [routeData, setRouteData] = useState<CalculateRoutesCommandOutput>();
	const { setPOICard, setBottomSheetMinHeight, setBottomSheetHeight, setUI, bottomSheetHeight, ui } = useBottomSheet();
	const { currentLocationData, viewpoint, mapUnit } = useMap();
	const { clearPoiList } = usePlace();
	const { getRoute, setDirections, isFetchingRoute } = useRoute();
	const [longitude, latitude] = useMemo(() => info.position as number[], [info]);
	const { isDesktop } = useDeviceMediaQuery();
	const { t, i18n } = useTranslation();
	const currentLang = i18n.language;
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const isLanguageRTL = ["ar", "he"].includes(currentLang);
	const POICardRef = useRef<HTMLDivElement>(null);

	const geodesicDistance = useMemo(
		() =>
			calculateGeodesicDistance(
				currentLocationData?.currentLocation
					? [
							currentLocationData.currentLocation.longitude as number,
							currentLocationData.currentLocation.latitude as number
					  ]
					: [viewpoint.longitude, viewpoint.latitude],
				[longitude, latitude],
				mapUnit === METRIC ? (KILOMETERS.toLowerCase() as Units) : (MILES.toLowerCase() as Units)
			),
		[viewpoint, currentLocationData, longitude, latitude, mapUnit]
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
					Destination: [longitude, latitude],
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
	}, [active, currentLocationData?.currentLocation, geodesicDistance, getRoute, latitude, longitude, routeData]);

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
		setDirections(info);
		clearPoiList();

		if (!isDesktop) {
			onClose(ResponsiveUIEnum.direction_to_routes);
		}
	}, [clearPoiList, info, isDesktop, onClose, setDirections]);

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
				<Flex data-testid="here-message-container" gap={0} direction={"column"}>
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

	const address = useMemo(() => {
		if (info?.address?.Label) {
			const split = info.address.Label.split(",");
			split.shift();
			return split.join(",").trim();
		} else {
			return `${latitude}, ${longitude}`;
		}
	}, [info, latitude, longitude]);

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
						info.address?.Label?.split(",")[0]
					}`}</Text>
					<View className="address-container">
						<View>
							<Text variation="tertiary">{address}</Text>
						</View>
						{isDesktop && (
							<IconCopyPages
								data-testid="copy-icon"
								className="copy-icon"
								onClick={() => navigator.clipboard.writeText(`${info.address?.Label?.split(",")[0]}` + ", " + address)}
							/>
						)}
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
			</Flex>
		),
		[address, info, isDesktop, onClose, onGetDirections, renderRouteInfo, t]
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
		latitude,
		longitude,
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
				longitude={longitude as number}
				latitude={latitude as number}
			>
				<POIBody />
			</PopupGl>
		);
	} else {
		return null;
	}
};

export default memo(Popup);

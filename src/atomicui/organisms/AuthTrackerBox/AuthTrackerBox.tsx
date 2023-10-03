/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button, Card, Flex, Loader, Text, View } from "@aws-amplify/ui-react";
import { IconArrow, IconCar, IconClose, IconDroneSolid, IconInfoSolid, IconSegment, IconWalking } from "@demo/assets";
import { GeofenceMarker } from "@demo/atomicui/molecules";
import { useAwsGeofence, useAwsRoute, useAwsTracker, useMediaQuery, useWebSocketBanner } from "@demo/hooks";
import { RouteDataType, TrackerType } from "@demo/types";
import { EventTypeEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import * as turf from "@turf/turf";
import { Position } from "aws-sdk/clients/location";
import { useTranslation } from "react-i18next";
import { Layer, MapRef, Marker, Source } from "react-map-gl";
import { Tooltip } from "react-tooltip";

import AuthTrackerSimulation from "./AuthTrackerSimulation";
import "./styles.scss";

export const trackerTypes = [
	{ type: TrackerType.CAR, icon: <IconCar width="1.54rem" height="1.54rem" /> },
	{ type: TrackerType.WALK, icon: <IconWalking width="1.54rem" height="1.54rem" /> },
	{ type: TrackerType.DRONE, icon: <IconDroneSolid width="1.54rem" height="1.54rem" /> }
];

interface AuthTrackerBoxProps {
	mapRef: MapRef | null;
	setShowAuthTrackerBox: (b: boolean) => void;
	clearCredsAndLocationClient?: () => void;
}

const AuthTrackerBox: React.FC<AuthTrackerBoxProps> = ({
	mapRef,
	setShowAuthTrackerBox,
	clearCredsAndLocationClient
}) => {
	const [isSaved, setIsSaved] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [routeData, setRouteData] = useState<RouteDataType | undefined>(undefined);
	const [points, setPoints] = useState<Position[] | undefined>(undefined);
	const [trackerPos, setTrackerPos] = useState<Position | undefined>(undefined);
	const [isCollapsed, setIsCollapsed] = useState(true);
	const { isFetchingRoute } = useAwsRoute();
	const { geofences, getGeofencesList } = useAwsGeofence();
	const {
		selectedTrackerType,
		setSelectedTrackerType,
		isEditingRoute,
		setIsEditingRoute,
		trackerPoints,
		setTrackerPoints
	} = useAwsTracker();
	const { Connection } = useWebSocketBanner();
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const fetchGeofencesList = useCallback(async () => getGeofencesList(), [getGeofencesList]);

	useEffect(() => {
		fetchGeofencesList();
		setIsEditingRoute(true);
	}, [fetchGeofencesList, setIsEditingRoute]);

	useEffect(() => {
		isDesktop && isCollapsed && setIsCollapsed(false);
	}, [isDesktop, isCollapsed]);

	const isSimulationEnbaled = useMemo(() => isSaved && routeData, [isSaved, routeData]);

	const onPlayPause = () => {
		if (isSimulationEnbaled) {
			!isPlaying && !isDesktop && !isCollapsed && setIsCollapsed(true);
			setIsPlaying(s => !s);
		}
	};

	const onClose = () => {
		clearCredsAndLocationClient && clearCredsAndLocationClient();
		setIsEditingRoute(false);
		setTrackerPoints(undefined);
		setShowAuthTrackerBox(false);
	};

	const onTrackerMarkerChange = (type: TrackerType) => {
		setRouteData(undefined);
		setPoints(undefined);
		setSelectedTrackerType(type);
	};

	const onClear = () => {
		setRouteData(undefined);
		setPoints(undefined);
		setTrackerPoints(undefined);
	};

	const onSave = () => {
		if (trackerPoints && trackerPoints.length >= 2) {
			setIsEditingRoute(false);
			setIsSaved(true);

			record(
				[
					{
						EventType: EventTypeEnum.TRACKER_SAVED,
						Attributes: { trackerType: selectedTrackerType, numberOfTrackerPoints: String(trackerPoints.length) }
					}
				],
				["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
			);
		}
	};

	const onEdit = () => {
		setIsEditingRoute(true);
		setIsSaved(false);
		setRouteData(undefined);
		setPoints(undefined);
		setTrackerPos(undefined);
		setIsPlaying(false);
		!isDesktop && isCollapsed && setIsCollapsed(false);
	};

	const renderGeofenceMarkers = useMemo(() => {
		if (geofences?.length) {
			return geofences.map(({ GeofenceId, Geometry: { Circle } }, idx) => {
				if (Circle) {
					const { Center } = Circle;

					return <GeofenceMarker key={idx} lng={Center[0]} lat={Center[1]} description={GeofenceId} />;
				}
			});
		}
	}, [geofences]);

	const renderGeofences = useMemo(() => {
		if (geofences?.length) {
			return geofences.map(({ GeofenceId, Geometry: { Circle } }, idx) => {
				if (Circle) {
					const { Center, Radius } = Circle;
					const circle = turf.circle(Center, Radius, { steps: 50, units: "meters" });
					const line = turf.lineString(circle.geometry.coordinates[0]);

					return (
						<div key={idx}>
							<Source id={`${GeofenceId}-circle-source-fill`} type="geojson" data={circle}>
								<Layer
									id={`${GeofenceId}-circle-layer-fill`}
									type="fill"
									paint={{
										"fill-opacity": 0.4,
										"fill-color": "#30b8c0"
									}}
								/>
							</Source>
							<Source id={`${GeofenceId}-circle-source-line`} type="geojson" data={line}>
								<Layer
									id={`${GeofenceId}-circle-layer-line`}
									type="line"
									layout={{ "line-cap": "round", "line-join": "round" }}
									paint={{
										"line-color": "#008296",
										"line-width": 3
									}}
								/>
							</Source>
						</div>
					);
				}
			});
		}
	}, [geofences]);

	const renderTrackerPointsList = useMemo(() => {
		if (trackerPoints?.length) {
			return (
				<Flex gap={0} direction="column" maxHeight={window.innerHeight - 250} overflow="scroll">
					{trackerPoints.map((point, idx) => {
						const icon = trackerTypes.filter(({ type }) => selectedTrackerType === type)[0].icon;

						return (
							<Flex key={idx} className="tracker-point-list-item">
								<Flex className="icon-container">
									{icon}
									{trackerPoints.length > 1 && idx + 1 !== trackerPoints.length && <View className="dotted-line" />}
								</Flex>
								<Text marginLeft="1.38rem">{`${point[1]}, ${point[0]}`}</Text>
							</Flex>
						);
					})}
				</Flex>
			);
		}
	}, [trackerPoints, selectedTrackerType]);

	const renderTrackerPointMarkers = useMemo(() => {
		if (trackerPoints?.length) {
			return trackerPoints.map((point, idx) => {
				const icon = trackerTypes.filter(({ type }) => selectedTrackerType === type)[0].icon;

				return (
					<Marker
						key={idx}
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							zIndex: 1,
							borderRadius: "1.23rem",
							backgroundColor: isPlaying || trackerPos ? "none" : "var(--white-color)",
							width: isPlaying || trackerPos ? "1.23rem" : "2.46rem",
							height: isPlaying || trackerPos ? "1.23rem" : "2.46rem",
							boxShadow: "0 0 10px rgba(0, 0, 0, 0.202633)"
						}}
						longitude={point[0]}
						latitude={point[1]}
					>
						{isPlaying || trackerPos ? <IconSegment width="1.23rem" height="1.23rem" /> : icon}
					</Marker>
				);
			});
		}
	}, [trackerPoints, selectedTrackerType, isPlaying, trackerPos]);

	const renderDottedLines = useMemo(() => {
		if (isEditingRoute && trackerPoints && trackerPoints?.length > 1) {
			const lineString:
				| GeoJSON.Feature<GeoJSON.Geometry>
				| GeoJSON.FeatureCollection<GeoJSON.Geometry>
				| GeoJSON.Geometry
				| string
				| undefined = {
				type: "Feature",
				properties: {},
				geometry: {
					type: "LineString",
					coordinates: trackerPoints
				}
			};

			return (
				<Source id="dotted-line-source" type="geojson" data={lineString}>
					<Layer
						id="dotted-line-layer"
						type="line"
						layout={{
							"line-join": "round",
							"line-cap": "round"
						}}
						paint={{
							"line-color": "#8e8e93",
							"line-width": 4,
							"line-dasharray": [0.0001, 2]
						}}
					/>
				</Source>
			);
		}
	}, [isEditingRoute, trackerPoints]);

	return (
		<>
			<Card className="tracking-card" left="1.62rem">
				<Flex className="tracking-card-header">
					<Text fontFamily="AmazonEmber-Medium" fontSize="1.08rem">
						{t("tracker.text")}
					</Text>
					<Flex gap={0} alignItems="center">
						<Flex data-testid="auth-tracker-box-close" className="tracking-card-close" onClick={onClose}>
							<IconClose />
						</Flex>
					</Flex>
				</Flex>
				{Connection}
				<Flex gap={0} alignItems="center" padding="1.23rem">
					<IconInfoSolid className="icon-plus-rounded" />
					<Text marginLeft="1.23rem" variation="tertiary" textAlign={isLtr ? "start" : "end"}>
						{t("tracker_box__click_any_point.text")}
					</Text>
				</Flex>
				<Flex className="marker-container" justifyContent="space-between">
					<Flex gap="0">
						{trackerTypes.map(({ type, icon }, idx) => (
							<View key={`${type}-${idx}`}>
								<View
									className={selectedTrackerType === type ? "icon-container selected" : "icon-container"}
									data-tooltip-id={type}
									data-tooltip-place="top"
									data-tooltip-content={
										type === TrackerType.CAR
											? t("tooltip__simulate_tracking_car.text")
											: type === TrackerType.WALK
											? t("tooltip__simulate_tracking_walk.text")
											: t("tooltip__simulate_tracking_drone.text")
									}
									marginLeft={!!idx ? "0.62rem" : "0rem"}
									onClick={() => onTrackerMarkerChange(type)}
								>
									{icon}
								</View>
								<Tooltip id={type} />
							</View>
						))}
					</Flex>
					{!!trackerPoints?.length && (
						<Flex className="buttons-container" width={isEditingRoute ? "" : ""}>
							{isEditingRoute ? (
								<>
									<View className="button" onClick={onClear}>
										<Text fontFamily="AmazonEmber-Bold" color="var(--red-color)">
											{t("clear.text")}
										</Text>
									</View>
									<View className="button" onClick={onSave}>
										<Text
											fontFamily="AmazonEmber-Bold"
											color={trackerPoints.length >= 2 ? "var(--primary-color)" : "var(--tertiary-color)"}
											opacity={trackerPoints.length >= 2 ? 1 : 0.3}
											marginLeft="1.9rem"
										>
											{t("save.text")}
										</Text>
									</View>
								</>
							) : (
								<>
									<Button
										className="play-pause-button"
										variation="primary"
										fontFamily="AmazonEmber-Bold"
										fontSize="0.92rem"
										isLoading={isFetchingRoute}
										onClick={onPlayPause}
									>
										{isFetchingRoute ? (
											<Loader size="large" />
										) : isPlaying ? (
											t("tracker_box__pause.text")
										) : (
											t("tracker_box__simulate.text")
										)}
									</Button>
									<Button className="edit-button" variation="primary" onClick={onEdit}>
										{t("tracker_box__edit.text")}
									</Button>
								</>
							)}
						</Flex>
					)}
				</Flex>
				{!isCollapsed && renderTrackerPointsList}
				{!!trackerPoints?.length && (
					<Flex className="show-hide-details-container bottom-border-radius" onClick={() => setIsCollapsed(s => !s)}>
						<Text className="text">
							{isCollapsed ? t("tracker_box__tracker_details.text") : t("hide_details.text")}
						</Text>
						<IconArrow style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)" }} />
					</Flex>
				)}
			</Card>
			<Tooltip id="notification-services" />
			{renderGeofenceMarkers}
			{renderGeofences}
			{renderTrackerPointMarkers}
			{renderDottedLines}
			<AuthTrackerSimulation
				mapRef={mapRef}
				isSaved={isSaved}
				routeData={routeData}
				setRouteData={setRouteData}
				isPlaying={isPlaying}
				setIsPlaying={setIsPlaying}
				selectedTrackerType={selectedTrackerType}
				points={points}
				setPoints={setPoints}
				trackerPos={trackerPos}
				setTrackerPos={setTrackerPos}
				isDesktop={isDesktop}
			/>
		</>
	);
};

export default AuthTrackerBox;

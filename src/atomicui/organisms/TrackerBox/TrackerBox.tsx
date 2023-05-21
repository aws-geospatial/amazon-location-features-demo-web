/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button, Card, Flex, Loader, Text, View } from "@aws-amplify/ui-react";
import { IconArrow, IconCar, IconClose, IconDroneSolid, IconInfoSolid, IconSegment, IconWalking } from "@demo/assets";
import { TextEl } from "@demo/atomicui/atoms";
import { GeofenceMarker } from "@demo/atomicui/molecules";
import { useAwsGeofence, useAwsRoute, useAwsTracker, useMediaQuery } from "@demo/hooks";
import { useWebSocketService } from "@demo/services";
import { RouteDataType, TrackerType } from "@demo/types";
import * as turf from "@turf/turf";
import { PubSub } from "aws-amplify";
import { Position } from "aws-sdk/clients/location";
import { Layer, MapRef, Marker, Source } from "react-map-gl";
import { Tooltip } from "react-tooltip";

import TrackerSimulation from "./TrackerSimulation";
import "./styles.scss";

interface TrackerBoxProps {
	mapRef: MapRef | null;
	setShowTrackingBox: (b: boolean) => void;
}

export const trackerTypes = [
	{ type: TrackerType.CAR, icon: <IconCar width="1.54rem" height="1.54rem" /> },
	{ type: TrackerType.WALK, icon: <IconWalking width="1.54rem" height="1.54rem" /> },
	{ type: TrackerType.DRONE, icon: <IconDroneSolid width="1.54rem" height="1.54rem" /> }
];

const TrackerBox: React.FC<TrackerBoxProps> = ({ mapRef, setShowTrackingBox }) => {
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
	const subscription = useWebSocketService();
	const isDesktop = useMediaQuery("(min-width: 1024px)");

	useEffect(() => {
		return () => {
			subscription.unsubscribe();
			PubSub.removePluggable("AWSIoTProvider");
		};
	}, [subscription]);

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
		setIsEditingRoute(false);
		setTrackerPoints(undefined);
		setShowTrackingBox(false);
	};

	const onTrackerMarkerChange = (type: TrackerType) => {
		setRouteData(undefined);
		setPoints(undefined);
		setSelectedTrackerType(type);
	};

	const onClear = () => setTrackerPoints(undefined);

	const onSave = () => {
		if (trackerPoints && trackerPoints.length >= 2) {
			setIsEditingRoute(false);
			setIsSaved(true);
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
								<TextEl marginLeft="1.38rem" text={`${point[1]}, ${point[0]}`} />
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
					<TextEl fontFamily="AmazonEmber-Medium" fontSize="1.08rem" text="Tracker" />
					<Flex gap={0} alignItems="center">
						<Flex className="tracking-card-close" onClick={onClose}>
							<IconClose />
						</Flex>
					</Flex>
				</Flex>
				<Flex gap={0} alignItems="center" padding="1.23rem">
					<IconInfoSolid className="icon-plus-rounded" />
					<TextEl
						marginLeft="1.23rem"
						variation="tertiary"
						text={"Click at any point on the map to start creating a tracking route"}
					/>
				</Flex>
				<Flex className="marker-container">
					{trackerTypes.map(({ type, icon }, idx) => (
						<View key={`${type}-${idx}`}>
							<View
								// className={
								// 	selectedTrackerType === type
								// 		? "icon-container selected"
								// 		: !!trackerPoints?.length
								// 		? "icon-container disabled"
								// 		: "icon-container"
								// }
								className={selectedTrackerType === type ? "icon-container selected" : "icon-container"}
								data-tooltip-id={type}
								data-tooltip-place="top"
								data-tooltip-content={
									type === TrackerType.CAR
										? "Simulate tracking using car as travel mode"
										: type === TrackerType.WALK
										? "Simulate tracking using walk as travel mode"
										: "Simulate tracking using drone as travel mode"
								}
								marginLeft={!!idx ? "0.62rem" : "0rem"}
								onClick={() => onTrackerMarkerChange(type)}
							>
								{icon}
							</View>
							<Tooltip id={type} />
						</View>
					))}
					{!!trackerPoints?.length && (
						<Flex className="buttons-container" width={isEditingRoute ? "6.14rem" : ""}>
							{isEditingRoute ? (
								<>
									<View className="button" onClick={onClear}>
										<TextEl fontFamily="AmazonEmber-Bold" color="var(--red-color)" text="Clear" />
									</View>
									<View className="button" onClick={onSave}>
										<TextEl
											fontFamily="AmazonEmber-Bold"
											color={trackerPoints.length >= 2 ? "var(--primary-color)" : "var(--tertiary-color)"}
											opacity={trackerPoints.length >= 2 ? 1 : 0.3}
											text="Save"
										/>
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
										{isFetchingRoute ? <Loader size="large" /> : isPlaying ? "Pause" : "Simulate"}
									</Button>
									<Button className="edit-button" variation="primary" onClick={onEdit}>
										Edit
									</Button>
								</>
							)}
						</Flex>
					)}
				</Flex>
				{!isCollapsed && renderTrackerPointsList}
				{!!trackerPoints?.length && (
					<Flex className="show-hide-details-container bottom-border-radius" onClick={() => setIsCollapsed(s => !s)}>
						<Text className="text">{isCollapsed ? "Tracker details" : "Hide details"}</Text>
						<IconArrow style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)" }} />
					</Flex>
				)}
			</Card>
			{renderGeofenceMarkers}
			{renderGeofences}
			{renderTrackerPointMarkers}
			{renderDottedLines}
			<TrackerSimulation
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

export default TrackerBox;

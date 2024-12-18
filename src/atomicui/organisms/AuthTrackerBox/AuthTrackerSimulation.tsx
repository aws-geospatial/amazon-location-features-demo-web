/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, MutableRefObject, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CalculateRoutesCommandInput } from "@aws-sdk/client-geo-routes";
import { useGeofence, useMap, usePersistedData, useRoute, useTracker } from "@demo/hooks";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { RouteDataType, TrackerType, TravelMode } from "@demo/types";
import { TriggeredByEnum } from "@demo/types/Enums";
import * as turf from "@turf/turf";
import { bbox, lineString } from "@turf/turf";
import { Layer, LayerProps, MapRef, Marker, Source } from "react-map-gl/maplibre";

import { trackerTypes } from "./AuthTrackerBox";

interface AuthTrackerSimulationProps {
	mapRef: MutableRefObject<MapRef | null>;
	isSaved: boolean;
	routeData?: RouteDataType;
	setRouteData: (rd?: RouteDataType) => void;
	isPlaying: boolean;
	setIsPlaying: (b: boolean) => void;
	selectedTrackerType: TrackerType;
	points?: number[][];
	setPoints: (p?: number[][]) => void;
	trackerPos?: number[];
	setTrackerPos: (tp?: number[]) => void;
}

const AuthTrackerSimulation: FC<AuthTrackerSimulationProps> = ({
	mapRef,
	isSaved,
	routeData,
	setRouteData,
	isPlaying,
	setIsPlaying,
	selectedTrackerType,
	points,
	setPoints,
	trackerPos,
	setTrackerPos
}) => {
	const [idx, setIdx] = useState(0);
	const timeoutId = useRef<NodeJS.Timeout | null>(null);
	const { mapUnit } = useMap();
	const { getRoute } = useRoute();
	const { evaluateGeofence } = useGeofence();
	const { trackerPoints } = useTracker();
	const { defaultRouteOptions } = usePersistedData();
	const { isDesktop, isTablet } = useDeviceMediaQuery();

	/* Route calculation for travel mode car or pedestrian */
	const calculateRoute = useCallback(async () => {
		if (isSaved && trackerPoints && trackerPoints.length >= 2) {
			const params: CalculateRoutesCommandInput = {
				InstructionsMeasurementSystem: mapUnit,
				Origin: trackerPoints[0],
				Destination: trackerPoints[trackerPoints.length - 1],
				TravelMode: selectedTrackerType === TrackerType.PEDESTRIAN ? TravelMode.PEDESTRIAN : TravelMode.CAR,
				Avoid: {
					TollRoads: defaultRouteOptions.avoidTolls,
					Ferries: defaultRouteOptions.avoidFerries
				},
				Waypoints: trackerPoints.length > 2 ? trackerPoints.map(tp => ({ Position: tp })) : undefined
			};
			const rd = await getRoute(params, TriggeredByEnum.TRACKER_SIMULATION_MODULE);
			rd &&
				setRouteData({
					...rd,
					travelMode: selectedTrackerType === TrackerType.PEDESTRIAN ? TrackerType.PEDESTRIAN : TrackerType.CAR
				});
		}
	}, [isSaved, trackerPoints, mapUnit, selectedTrackerType, defaultRouteOptions, getRoute, setRouteData]);

	/* Route calculation for travel mode drone */
	const calculatePath = useCallback(() => {
		if (isSaved && trackerPoints && trackerPoints.length >= 2) {
			const lineDistance = turf.lineDistance(
				{
					type: "FeatureCollection",
					features: [
						{
							type: "Feature",
							properties: {},
							geometry: {
								type: "LineString",
								coordinates: trackerPoints
							}
						}
					]
				},
				{ units: "kilometers" }
			);
			const arc = [];
			const steps = 150;

			for (let i = 0; i < lineDistance; i += lineDistance / steps) {
				const segment = turf.along(
					{
						type: "Feature",
						properties: {},
						geometry: {
							type: "LineString",
							coordinates: trackerPoints
						}
					},
					i,
					{ units: "kilometers" }
				);
				arc.push(segment.geometry.coordinates);
			}

			const lineString = turf.lineString(arc);
			setRouteData({
				travelMode: TrackerType.DRONE,
				Routes: [
					{
						Legs: [
							{
								Geometry: {
									LineString: lineString.geometry.coordinates
								}
							}
						],
						Summary: {
							Distance: lineDistance
						}
					}
				]
			} as unknown as RouteDataType);
			setPoints(arc);
		}
	}, [isSaved, trackerPoints, setRouteData, setPoints]);

	useEffect(() => {
		if (isSaved && !routeData) {
			setIsPlaying(false);
			setTrackerPos(undefined);
			setPoints(undefined);
			setIdx(0);
			clearTimeout(timeoutId.current!);
			selectedTrackerType === TrackerType.DRONE ? calculatePath() : calculateRoute();
		}
	}, [isSaved, routeData, setIsPlaying, setTrackerPos, setPoints, selectedTrackerType, calculatePath, calculateRoute]);

	useEffect(() => {
		if (routeData && !points) {
			const pointsArr: number[][] = [];
			routeData.Routes![0].Legs?.forEach(({ Geometry }) =>
				Geometry?.LineString?.forEach(coords => pointsArr.push(coords))
			);
			pointsArr.length && setPoints(pointsArr);
		}
	}, [routeData, points, setPoints]);

	const timeoutTime = useMemo(
		() => (selectedTrackerType === TrackerType.DRONE ? 100 : selectedTrackerType === TrackerType.CAR ? 600 : 1200),
		[selectedTrackerType]
	);

	useEffect(() => {
		// Clear existing timeout when changing idx or pausing
		if (timeoutId.current) {
			clearTimeout(timeoutId.current);
			timeoutId.current = null;
		}

		if (isPlaying) {
			if (!!points && idx < points.length) {
				// Update tracker position
				setTrackerPos(points[idx]);
				// Evaluate geofences to check if tracker is inside any of them
				evaluateGeofence(points[idx]);
				// Increment idx after specified time
				timeoutId.current = setTimeout(() => setIdx(idx + 1), timeoutTime);
			} else {
				// Stop tracker simulation when end of points array is reached
				setIsPlaying(false);
				// Reset tracker position to undefined when end of points array is reached
				setTrackerPos(undefined);
				// Reset index to 0 when end of points array is reached
				setIdx(0);
			}
		}

		return () => {
			timeoutId.current && clearTimeout(timeoutId.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPlaying, idx]);

	useEffect(() => {
		if (routeData && routeData.Routes![0]?.Legs) {
			let lineStringArr: number[][] = [];

			routeData.Routes![0].Legs.map(({ Geometry }) => {
				if (!!Geometry?.LineString && Geometry?.LineString?.length > 0) {
					lineStringArr = [...lineStringArr, ...Geometry.LineString];
				}
			});

			const options = isDesktop
				? {
						padding: {
							top: 200,
							bottom: 200,
							left: 450,
							right: 200
						},
						speed: 5,
						linear: true
				  }
				: isTablet
				? {
						padding: {
							top: 100,
							bottom: 100,
							left: 390,
							right: 50
						},
						speed: 5,
						linear: true
				  }
				: {
						padding: {
							top: 100,
							bottom: 420,
							left: 60,
							right: 70
						},
						speed: 5,
						linear: true
				  };
			const line = lineString(lineStringArr);
			const bounds = bbox(line);
			mapRef.current?.fitBounds(bounds as [number, number, number, number], options);
		}
	}, [mapRef, routeData, isDesktop, isTablet]);

	const renderRoute = useMemo(() => {
		if (points) {
			const passedLineJson:
				| GeoJSON.Feature<GeoJSON.Geometry>
				| GeoJSON.FeatureCollection<GeoJSON.Geometry>
				| GeoJSON.Geometry
				| string
				| undefined = {
				id: "passed-tracking-route-source",
				type: "Feature",
				properties: {},
				geometry: {
					type: "LineString",
					coordinates: points.slice(0, idx)
				}
			};
			const passedLayerProps: LayerProps = {
				id: "passed-tracking-route-layer",
				type: "line",
				layout: {
					"line-join": "round",
					"line-cap": "round"
				},
				paint: { "line-color": idx > 0 ? "#008296" : "#8e8e93", "line-width": 4, "line-dasharray": [0.0001, 2] }
			};
			const pendingLineJson:
				| GeoJSON.Feature<GeoJSON.Geometry>
				| GeoJSON.FeatureCollection<GeoJSON.Geometry>
				| GeoJSON.Geometry
				| string
				| undefined = {
				id: "pending-tracking-route-source",
				type: "Feature",
				properties: {},
				geometry: {
					type: "LineString",
					coordinates: points.slice(idx, points.length)
				}
			};
			const pendingLayerProps: LayerProps = {
				id: "pending-tracking-route-layer",
				type: "line",
				layout: {
					"line-join": "round",
					"line-cap": "round"
				},
				paint: { "line-color": "#8E8E93", "line-width": 4, "line-dasharray": [0.0001, 2] }
			};

			return (
				<>
					<Source type="geojson" data={passedLineJson}>
						<Layer {...passedLayerProps} />
					</Source>
					<Source type="geojson" data={pendingLineJson}>
						<Layer {...pendingLayerProps} />
					</Source>
				</>
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [points, trackerPos]);

	const renderRouteTracker = useMemo(() => {
		if (trackerPos) {
			const icon = trackerTypes.filter(({ type }) => type === selectedTrackerType)[0].icon;

			return (
				<Marker
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 1,
						borderRadius: "1.23rem",
						backgroundColor: "var(--white-color)",
						width: "2.46rem",
						height: "2.46rem",
						boxShadow: "0 0 10px rgba(0, 0, 0, 0.202633)"
					}}
					longitude={trackerPos[0]}
					latitude={trackerPos[1]}
				>
					{icon}
				</Marker>
			);
		}
	}, [trackerPos, selectedTrackerType]);

	return (
		<>
			{renderRoute}
			{renderRouteTracker}
		</>
	);
};

export default memo(AuthTrackerSimulation);

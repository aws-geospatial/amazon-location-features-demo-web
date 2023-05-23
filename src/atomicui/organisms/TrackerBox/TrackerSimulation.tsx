/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo } from "react";

// import { IconTrackerIntersect } from "@demo/assets";
import { useAwsGeofence, useAwsRoute, useAwsTracker, usePersistedData } from "@demo/hooks";
import { DistanceUnit, RouteDataType, TrackerType, TravelMode } from "@demo/types";
import * as turf from "@turf/turf";
import { CalculateRouteRequest, Position } from "aws-sdk/clients/location";
import { Layer, LayerProps, MapRef, Marker, Source } from "react-map-gl";
// import { calculateGeodesicDistance } from "@demo/utils/geoCalculation";

import { trackerTypes } from "./TrackerBox";

interface TrackerSimulationProps {
	mapRef: MapRef | null;
	isSaved: boolean;
	routeData?: RouteDataType;
	setRouteData: (rd?: RouteDataType) => void;
	isPlaying: boolean;
	setIsPlaying: (b: boolean) => void;
	selectedTrackerType: TrackerType;
	points?: Position[];
	setPoints: (p?: Position[]) => void;
	trackerPos?: Position;
	setTrackerPos: (tp?: Position) => void;
	isDesktop: boolean;
}

let interval: NodeJS.Timer | undefined;
let idx = -1;

const TrackerSimulation: React.FC<TrackerSimulationProps> = ({
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
	setTrackerPos,
	isDesktop
}) => {
	const { getRoute } = useAwsRoute();
	const {
		evaluateGeofence
		// geofences
	} = useAwsGeofence();
	const { trackerPoints } = useAwsTracker();
	const { defaultRouteOptions } = usePersistedData();

	/* Route calculation for travel mode car or walk */
	const calculateRoute = useCallback(async () => {
		if (trackerPoints && trackerPoints.length >= 2) {
			const params: Omit<CalculateRouteRequest, "CalculatorName" | "DepartNow"> = {
				IncludeLegGeometry: true,
				DistanceUnit: DistanceUnit.KILOMETERS,
				DeparturePosition: trackerPoints[0],
				DestinationPosition: trackerPoints[trackerPoints.length - 1],
				TravelMode: selectedTrackerType === TrackerType.WALK ? TravelMode.WALKING : TravelMode.CAR,
				CarModeOptions:
					selectedTrackerType === TrackerType.CAR
						? {
								AvoidFerries: defaultRouteOptions.avoidFerries,
								AvoidTolls: defaultRouteOptions.avoidTolls
						  }
						: undefined,
				WaypointPositions: trackerPoints.length > 2 ? trackerPoints.slice(1, trackerPoints.length - 1) : undefined
			};
			const rd = await getRoute(params as CalculateRouteRequest);
			rd &&
				setRouteData({
					...rd,
					travelMode: selectedTrackerType === TrackerType.WALK ? TrackerType.WALK : TrackerType.CAR
				});
		}
	}, [trackerPoints, selectedTrackerType, defaultRouteOptions, getRoute, setRouteData]);

	/* Route calculation for travel mode drone */
	const calculatePath = useCallback(() => {
		if (trackerPoints && trackerPoints.length >= 2) {
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
			const steps = 350;

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
			const bbox = turf.bbox(lineString);
			setRouteData({
				travelMode: TrackerType.DRONE,
				Summary: {
					RouteBBox: bbox,
					DataSource: "",
					Distance: lineDistance,
					DistanceUnit: "Kilometers",
					DurationSeconds: 0
				},
				Legs: []
			} as RouteDataType);
			setPoints(arc);
		}
	}, [trackerPoints, setRouteData, setPoints]);

	useEffect(() => {
		if (isSaved && !routeData) {
			setIsPlaying(false);
			setTrackerPos(undefined);
			setPoints(undefined);
			idx = -1;
			clearInterval(interval);
			selectedTrackerType === TrackerType.DRONE ? calculatePath() : calculateRoute();
		}
	}, [isSaved, routeData, setIsPlaying, setTrackerPos, setPoints, selectedTrackerType, calculatePath, calculateRoute]);

	useEffect(() => {
		if (routeData && !points) {
			const pointsArr: Position[] = [];
			routeData.Legs.forEach(({ Geometry }) => Geometry?.LineString?.forEach(coords => pointsArr.push(coords)));
			pointsArr.length && setPoints(pointsArr);
		}
	}, [routeData, points, setPoints]);

	useEffect(() => {
		if (isPlaying) {
			interval = setInterval(() => {
				idx++;

				if (!!points && idx < points?.length) {
					setTrackerPos(points[idx]);
					evaluateGeofence(points[idx]);

					if (idx === points.length - 1) {
						setIsPlaying(false);
						setTrackerPos(undefined);
						idx = -1;
					}
				} else {
					clearInterval(interval);
					idx = -1;
				}
			}, 600);
		} else if (!!interval) {
			clearInterval(interval);
		}
	}, [isPlaying, points, setTrackerPos, evaluateGeofence, setIsPlaying]);

	const renderRoute = useMemo(() => {
		if (routeData && points) {
			const boundingBox = routeData.Summary.RouteBBox;
			isDesktop
				? mapRef?.fitBounds(
						[
							[boundingBox[0], boundingBox[1]],
							[boundingBox[2], boundingBox[3]]
						],
						{
							padding: {
								top: 200,
								bottom: 200,
								left: 450,
								right: 200
							},
							speed: 5,
							linear: false
						}
				  )
				: mapRef?.fitBounds(
						[
							[boundingBox[0], boundingBox[1]],
							[boundingBox[2], boundingBox[3]]
						],
						{
							padding: {
								top: 230,
								bottom: 50,
								left: 60,
								right: 70
							},
							speed: 5,
							linear: false
						}
				  );

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
	}, [mapRef, routeData, points, trackerPos, isDesktop]);

	const renderRouteTracker = useMemo(() => {
		if (trackerPos) {
			const icon = trackerTypes.filter(({ type }) => type === selectedTrackerType)[0].icon;
			// let intersected = false;

			// geofences?.forEach(g => {
			// 	const distanceInKm = calculateGeodesicDistance(
			// 		[g.Geometry.Circle?.Center[0] as number, g.Geometry.Circle?.Center[1] as number],
			// 		[trackerPos[0], trackerPos[1]]
			// 	) as number;
			// 	const distanceInM = distanceInKm * 1000;
			// 	const diff = distanceInM - g.Geometry.Circle!.Radius;

			// 	if (Math.abs(diff) <= 19) {
			// 		intersected = true;
			// 		setTimeout(() => {
			// 			intersected = false;
			// 		}, 500);
			// 	}
			// });

			return (
				<Marker
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 1,
						borderRadius: "1.23rem",
						// backgroundColor: intersected ? "transparent" : "var(--white-color)",
						backgroundColor: "var(--white-color)",
						width: "2.46rem",
						height: "2.46rem",
						// boxShadow: intersected ? "none" : "0 0 10px rgba(0, 0, 0, 0.202633)"
						boxShadow: "0 0 10px rgba(0, 0, 0, 0.202633)"
					}}
					longitude={trackerPos[0]}
					latitude={trackerPos[1]}
				>
					{/* {intersected ? <IconTrackerIntersect /> : icon} */}
					{icon}
				</Marker>
			);
		}
	}, [
		trackerPos,
		selectedTrackerType
		// geofences
	]);

	return (
		<>
			{renderRoute}
			{renderRouteTracker}
		</>
	);
};

export default TrackerSimulation;

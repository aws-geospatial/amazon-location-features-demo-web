/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useCallback, useEffect } from "react";

import { CircleDrawEventType, CircleFeatureType } from "@demo/types";

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as turf from "@turf/turf";
import { Position } from "aws-sdk/clients/location";
import { CircleMode, DirectMode, DragCircleMode, SimpleSelectMode } from "mapbox-gl-draw-circle";
import { LngLatBoundsLike, useControl, useMap } from "react-map-gl";

const draw = new MapboxDraw({
	displayControlsDefault: false,
	defaultMode: "draw_circle",
	userProperties: true,
	modes: {
		...MapboxDraw.modes,
		draw_circle: CircleMode,
		drag_circle: DragCircleMode,
		direct_select: DirectMode,
		simple_select: SimpleSelectMode
	},
	styles: [
		{
			id: "gl-draw-polygon-fill",
			type: "fill",
			filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
			paint: {
				"fill-color": "#008296",
				"fill-outline-color": "#008296",
				"fill-opacity": 0.2
			}
		},
		{
			id: "gl-draw-polygon-stroke-active",
			type: "line",
			filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
			layout: {
				"line-cap": "round",
				"line-join": "round"
			},
			paint: {
				"line-color": "#008296",
				"line-width": 2
			}
		},
		{
			id: "gl-draw-polygon-and-line-vertex-active",
			type: "circle",
			filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
			paint: {
				"circle-radius": 6,
				"circle-color": "#008296"
			}
		}
	]
});

interface CircleDrawControlProps {
	geofenceCenter?: Position;
	radiusInM: number;
	onCreate: (e: CircleDrawEventType) => void;
	onUpdate: (e: CircleDrawEventType) => void;
	isDesktop: boolean;
}

const CircleDrawControl: React.FC<CircleDrawControlProps> = ({
	geofenceCenter,
	radiusInM,
	onCreate,
	onUpdate,
	isDesktop
}) => {
	const { current: mapRef } = useMap();

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (geofenceCenter) {
				const circle = turf.circle(geofenceCenter, radiusInM, { steps: 50, units: "meters" });
				const featureCollection: CircleFeatureType = {
					type: "FeatureCollection",
					features: [
						{
							type: "Feature",
							properties: {
								center: geofenceCenter,
								isCircle: true,
								radiusInKm: radiusInM / 1000
							},
							geometry: {
								type: "Polygon",
								coordinates: circle.geometry.coordinates
							}
						}
					]
				};
				draw.deleteAll();
				draw.set(featureCollection);
				const line = turf.lineString(circle.geometry.coordinates[0]);
				const bbox = turf.bbox(line);
				isDesktop
					? mapRef?.fitBounds(bbox as LngLatBoundsLike, { padding: 100 })
					: mapRef?.fitBounds(bbox as LngLatBoundsLike, { padding: { top: 280, right: 25, bottom: 25, left: 25 } });
			} else {
				const all = draw.getAll() as unknown as CircleDrawEventType;
				all?.features[0]?.geometry?.coordinates[0]?.length > 2 && draw.deleteAll();
			}
		}, 0);

		return () => {
			clearTimeout(timeout);
		};
	}, [geofenceCenter, radiusInM, isDesktop, mapRef]);

	const drawCreate = useCallback((e: CircleDrawEventType) => onCreate(e), [onCreate]);

	const drawUpdate = useCallback((e: CircleDrawEventType) => onUpdate(e), [onUpdate]);

	useControl(
		({ map }) => {
			map.on("draw.create", drawCreate);
			map.on("draw.update", drawUpdate);

			return draw;
		},
		({ map }) => {
			map.off("draw.create", drawCreate);
			map.off("draw.update", drawUpdate);
		}
	);

	return null;
};

export default CircleDrawControl;

import { FC, useEffect, useMemo, useRef } from "react";

import { View } from "@aws-amplify/ui-react";
import { IconBusActive, IconBusInactive } from "@demo/assets/svgs";
import { useGeofence } from "@demo/hooks";
import { TrackingHistoryItemtype, TrackingHistoryTypeEnum } from "@demo/types";
import { Layer, LayerProps, Marker, Source } from "react-map-gl/maplibre";

interface UnauthRouteSimulationProps {
	id: string;
	name: string;
	geofenceCollection: string;
	coordinates: number[][];
	isPlaying: boolean;
	disabled: boolean;
	idx: number;
	setIdx: (idx: number) => void;
	trackerPos: number[];
	setTrackerPos: (pos: number[]) => void;
	updateTrackingHistory: (id: string, newTrackingHistory: TrackingHistoryItemtype) => void;
}

const UnauthRouteSimulation: FC<UnauthRouteSimulationProps> = ({
	id,
	// name,
	geofenceCollection,
	coordinates,
	isPlaying,
	disabled,
	idx,
	setIdx,
	trackerPos,
	setTrackerPos,
	updateTrackingHistory
}) => {
	const timeoutId = useRef<NodeJS.Timeout | null>(null);
	const { evaluateGeofence } = useGeofence();

	useEffect(() => {
		// Clear existing timeout when changing idx or pausing
		if (timeoutId.current) {
			clearTimeout(timeoutId.current);
			timeoutId.current = null;
		}

		if (isPlaying && !disabled) {
			if (idx < coordinates.length) {
				// Update tracker position
				setTrackerPos(coordinates[idx]);
				// Evaluate geofences to check if tracker is inside any of them
				evaluateGeofence(coordinates[idx], `location.aws.com.demo.geofences.${geofenceCollection}`);
				// Update tracking history with tracker positions
				updateTrackingHistory(id, {
					type: TrackingHistoryTypeEnum.TRACKER,
					title: `${coordinates[idx][0]}, ${coordinates[idx][1]}`,
					description: null,
					subDescription: new Date().toISOString()
				});
				// increment idx after 1 second
				timeoutId.current = setTimeout(() => setIdx(idx + 1), 150);
			} else {
				// Reset index to 0 when end of coordinates array is reached
				setIdx(0);
				// Accordingly reset tracker position to starting point
				setTrackerPos(coordinates[0]);
			}
		}

		// Cleanup on component unmount or when dependencies change
		return () => {
			timeoutId.current && clearTimeout(timeoutId.current);
		};

		// Removed coordinates from dependencies to prevent resetting idx when coordinates change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPlaying, disabled, idx, id]);

	const renderRoute = useMemo(() => {
		const passedLineJson:
			| GeoJSON.Feature<GeoJSON.Geometry>
			| GeoJSON.FeatureCollection<GeoJSON.Geometry>
			| GeoJSON.Geometry
			| string
			| undefined = {
			id: `${id}-passed-tracking-route-source`,
			type: "Feature",
			properties: {},
			geometry: {
				type: "LineString",
				coordinates
			}
		};
		const passedLayerProps: LayerProps = {
			id: `${id}-passed-tracking-route-layer`,
			type: "line",
			layout: {
				"line-join": "round",
				"line-cap": "round"
			},
			paint: {
				"line-color": disabled ? "#8E8E93" : "#008296",
				"line-width": 4,
				"line-dasharray": [0.0001, 2]
			}
		};

		return (
			<Source type="geojson" data={passedLineJson}>
				<Layer {...passedLayerProps} />
			</Source>
		);
	}, [id, disabled, coordinates]);

	const renderRouteTracker = useMemo(() => {
		return (
			<Marker
				key={`${id}-tracker`}
				style={{
					zIndex: 2
				}}
				longitude={trackerPos[0]}
				latitude={trackerPos[1]}
			>
				{disabled ? <IconBusInactive /> : <IconBusActive />}
			</Marker>
		);
	}, [disabled, trackerPos, id]);

	return (
		<View key={id}>
			{renderRoute}
			{renderRouteTracker}
		</View>
	);
};

export default UnauthRouteSimulation;

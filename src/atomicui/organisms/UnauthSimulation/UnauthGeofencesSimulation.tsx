import { FC, memo, useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { View } from "@aws-amplify/ui-react";
import { ListGeofenceResponseEntry } from "@aws-sdk/client-location";
import { useAwsGeofence } from "@demo/hooks";
import * as turf from "@turf/turf";
import { Layer, Source } from "react-map-gl";

interface UnauthGeofencesSimulationProps {
	id: string;
	name: string;
	geofenceCollection: string;
	trackerPos: number[];
}

const UnauthGeofencesSimulation: FC<UnauthGeofencesSimulationProps> = ({
	id,
	// name,
	geofenceCollection,
	trackerPos
}) => {
	const [geofences, setGeofences] = useState<Array<ListGeofenceResponseEntry> | undefined>(undefined);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [isPending, startTransition] = useTransition();
	const { getGeofencesList } = useAwsGeofence();

	const fetchGeofencesList = useCallback(
		async () =>
			await getGeofencesList(`location.aws.com.demo.geofences.${geofenceCollection}`, geofences => {
				startTransition(() => {
					setGeofences(geofences);
				});
			}),
		[getGeofencesList, geofenceCollection]
	);

	useEffect(() => {
		fetchGeofencesList();
	}, [fetchGeofencesList]);

	const renderGeofences = useMemo(() => {
		if (geofences?.length) {
			return geofences.map(({ GeofenceId, Geometry }, idx) => {
				if (Geometry?.Circle) {
					const { Circle } = Geometry;
					const { Center, Radius } = Circle;
					const circle = turf.circle(Center!, Radius!, { steps: 50, units: "meters" });
					const line = turf.lineString(circle.geometry.coordinates[0]);
					const isTrackerInGeofence = turf.booleanPointInPolygon(turf.point(trackerPos), circle);

					return (
						<View key={idx}>
							<Source id={`${GeofenceId}-circle-source-fill`} type="geojson" data={circle}>
								<Layer
									id={`${GeofenceId}-circle-layer-fill`}
									type="fill"
									paint={{
										"fill-opacity": 0.4,
										"fill-color": isTrackerInGeofence ? "#EAD1A2" : "#30b8c0"
									}}
								/>
							</Source>
							<Source id={`${GeofenceId}-circle-source-line`} type="geojson" data={line}>
								<Layer
									id={`${GeofenceId}-circle-layer-line`}
									type="line"
									layout={{ "line-cap": "round", "line-join": "round" }}
									paint={{
										"line-color": isTrackerInGeofence ? "#FF9900" : "transparent",
										"line-width": isTrackerInGeofence ? 2 : 0
									}}
								/>
							</Source>
						</View>
					);
				}
			});
		}
	}, [geofences, trackerPos]);

	return <View key={id}>{renderGeofences}</View>;
};

export default memo(UnauthGeofencesSimulation);

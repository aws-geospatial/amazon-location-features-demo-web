import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { View } from "@aws-amplify/ui-react";
// import { GeofenceMarker } from "@demo/atomicui/molecules";
import { useAwsGeofence } from "@demo/hooks";
import * as turf from "@turf/turf";
import { ListGeofenceResponseEntry } from "aws-sdk/clients/location";
import { Layer, Source } from "react-map-gl";

interface UnauthGeofencesSimulationProps {
	id: string;
	name: string;
	geofenceCollection: string;
}

const UnauthGeofencesSimulation: React.FC<UnauthGeofencesSimulationProps> = ({
	id,
	// name,
	geofenceCollection
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
			return geofences.map(({ GeofenceId, Geometry: { Circle } }, idx) => {
				if (Circle) {
					const { Center, Radius } = Circle;
					const circle = turf.circle(Center, Radius, { steps: 50, units: "meters" });
					const line = turf.lineString(circle.geometry.coordinates[0]);

					return (
						<View key={idx}>
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
										"line-color": "transparent",
										"line-width": 0
									}}
								/>
							</Source>
						</View>
					);
				}
			});
		}
	}, [geofences]);

	return <View key={id}>{renderGeofences}</View>;
};

export default React.memo(UnauthGeofencesSimulation);

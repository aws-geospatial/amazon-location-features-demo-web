/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { BatchEvaluateGeofencesRequest, ListGeofencesRequest } from "@aws-sdk/client-location";
import { appConfig } from "@demo/core/constants";
import { useClient } from "@demo/hooks";

const {
	MAP_RESOURCES: { GEOFENCE_COLLECTION, DEVICE_ID_WEB }
} = appConfig;

const useGeofenceService = () => {
	const { locationClient } = useClient();

	return useMemo(
		() => ({
			listGeofences: async (geofenceCollection?: string) => {
				const params: ListGeofencesRequest = {
					CollectionName: geofenceCollection || GEOFENCE_COLLECTION
				};

				return await locationClient?.listGeofences(params);
			},
			evaluateGeofence: async (Position: number[], IdentityId: string, geofenceCollection?: string) => {
				const params: BatchEvaluateGeofencesRequest = {
					CollectionName: geofenceCollection || GEOFENCE_COLLECTION,
					DevicePositionUpdates: [
						{
							DeviceId: DEVICE_ID_WEB,
							Position,
							SampleTime: new Date(),
							PositionProperties: {
								region: IdentityId.split(":")[0],
								id: IdentityId.split(":")[1]
							}
						}
					]
				};

				return await locationClient?.batchEvaluateGeofences(params);
			}
		}),
		[locationClient]
	);
};

export default useGeofenceService;

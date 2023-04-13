/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import appConfig from "@demo/core/constants/appConfig";
import { useAws } from "@demo/hooks";
import {
	BatchDeleteGeofenceRequest,
	BatchEvaluateGeofencesRequest,
	GeofenceGeometry,
	ListGeofencesRequest,
	Position,
	PutGeofenceRequest
} from "aws-sdk/clients/location";

const { GEOFENCE_COLLECTION, DEVICE_ID_WEB } = appConfig;

const useAwsGeofenceService = () => {
	const { locationClient } = useAws();

	return useMemo(
		() => ({
			listGeofences: async () => {
				const params: ListGeofencesRequest = {
					CollectionName: GEOFENCE_COLLECTION
				};

				return await locationClient?.listGeofences(params).promise();
			},
			putGeofence: async (GeofenceId: string, Geometry: GeofenceGeometry) => {
				const params: PutGeofenceRequest = {
					CollectionName: GEOFENCE_COLLECTION,
					GeofenceId,
					Geometry
				};

				return await locationClient?.putGeofence(params).promise();
			},
			deleteGeofence: async (GeofenceId: string) => {
				const params: BatchDeleteGeofenceRequest = {
					CollectionName: GEOFENCE_COLLECTION,
					GeofenceIds: [GeofenceId]
				};

				return await locationClient?.batchDeleteGeofence(params).promise();
			},
			evaluateGeofence: async (Position: Position, IdentityId: string) => {
				const params: BatchEvaluateGeofencesRequest = {
					CollectionName: GEOFENCE_COLLECTION,
					DevicePositionUpdates: [
						{
							DeviceId: DEVICE_ID_WEB,
							Position,
							SampleTime: new Date().toISOString() as unknown as Date,
							PositionProperties: {
								region: IdentityId.split(":")[0],
								id: IdentityId.split(":")[1]
							}
						}
					]
				};

				return await locationClient?.batchEvaluateGeofences(params).promise();
			}
		}),
		[locationClient]
	);
};

export default useAwsGeofenceService;

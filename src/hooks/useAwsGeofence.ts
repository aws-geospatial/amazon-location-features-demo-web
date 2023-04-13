/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useAwsGeofenceService } from "@demo/services";
import { useAmplifyAuthStore, useAwsGeofenceStore } from "@demo/stores";

import { errorHandler } from "@demo/utils/errorHandler";
import { GeofenceGeometry, Position } from "aws-sdk/clients/location";

const useAwsGeofence = () => {
	const store = useAwsGeofenceStore();
	const { setInitial } = store;
	const { setState } = useAwsGeofenceStore;
	const geofenceService = useAwsGeofenceService();
	const authStore = useAmplifyAuthStore();

	const methods = useMemo(
		() => ({
			getGeofencesList: async () => {
				try {
					setState({ isFetchingGeofences: true });
					const res = await geofenceService.listGeofences();
					setState({ geofences: res?.Entries });
				} catch (error) {
					errorHandler(error, "Failed to fetch geofences");
				} finally {
					setState({ isFetchingGeofences: false });
				}
			},
			createGeofence: async (GeofenceId: string, Geometry: GeofenceGeometry) => {
				try {
					setState({ isCreatingGeofence: true });
					const res = await geofenceService.putGeofence(GeofenceId, Geometry);
					res && methods.getGeofencesList();
				} catch (error) {
					errorHandler(error, "Failed to create geofence");
				} finally {
					setState({ isCreatingGeofence: false });
				}
			},
			deleteGeofence: async (GeofenceId: string) => {
				try {
					setState({ isDeletingGeofence: true });
					const res = await geofenceService.deleteGeofence(GeofenceId);
					res && methods.getGeofencesList();
				} catch (error) {
					errorHandler(error, "Failed to delete geofence");
				} finally {
					setState({ isDeletingGeofence: false });
				}
			},
			evaluateGeofence: async (Position: Position) => {
				try {
					await geofenceService.evaluateGeofence(Position, authStore.credentials!.identityId);
				} catch (error) {
					errorHandler(error, "Failed to evaluate geofence");
				}
			},
			setIsAddingGeofence: (isAddingGeofence: boolean) => {
				setState({ isAddingGeofence });
			},
			resetStore: () => {
				setState({ geofences: undefined });
				setInitial();
			}
		}),
		[setInitial, setState, geofenceService, authStore.credentials]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useAwsGeofence;

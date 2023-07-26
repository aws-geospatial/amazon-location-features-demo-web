/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useAwsGeofenceService } from "@demo/services";
import { useAmplifyAuthStore, useAwsGeofenceStore } from "@demo/stores";
import { EventTypeEnum, NotificationHistoryItemtype } from "@demo/types";
import { record } from "@demo/utils/analyticsUtils";
import { errorHandler } from "@demo/utils/errorHandler";
import { GeofenceGeometry, ListGeofenceResponseEntry, Position } from "aws-sdk/clients/location";
import { useTranslation } from "react-i18next";

const useAwsGeofence = () => {
	const store = useAwsGeofenceStore();
	const { setInitial } = store;
	const { setState } = useAwsGeofenceStore;
	const geofenceService = useAwsGeofenceService();
	const authStore = useAmplifyAuthStore();
	const { t } = useTranslation();

	const methods = useMemo(
		() => ({
			getGeofencesList: async (
				geofenceCollection?: string,
				cb?: (geofences?: Array<ListGeofenceResponseEntry>) => void
			) => {
				try {
					setState({ isFetchingGeofences: true });
					const res = await geofenceService.listGeofences(geofenceCollection);
					cb ? cb(res?.Entries) : setState({ geofences: res?.Entries });
					record(
						[{ EventType: EventTypeEnum.GET_GEOFENCES_LIST_SUCCESSFUL, Attributes: {} }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
				} catch (error) {
					record(
						[{ EventType: EventTypeEnum.GET_GEOFENCES_LIST_FAILED, Attributes: {} }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
					errorHandler(error, t("error_handler__failed_fetch_geofences.text") as string);
				} finally {
					setState({ isFetchingGeofences: false });
				}
			},
			createGeofence: async (GeofenceId: string, Geometry: GeofenceGeometry) => {
				try {
					setState({ isCreatingGeofence: true });
					const res = await geofenceService.putGeofence(GeofenceId, Geometry);
					res && methods.getGeofencesList();
					record(
						[{ EventType: EventTypeEnum.GEOFENCE_CREATION_SUCCESSFUL, Attributes: {} }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
				} catch (error) {
					record(
						[{ EventType: EventTypeEnum.GEOFENCE_CREATION_FAILED, Attributes: {} }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
					errorHandler(error, t("error_handler__failed_create_geofences.text") as string);
				} finally {
					setState({ isCreatingGeofence: false });
				}
			},
			deleteGeofence: async (GeofenceId: string) => {
				try {
					setState({ isDeletingGeofence: true });
					const res = await geofenceService.deleteGeofence(GeofenceId);
					res && methods.getGeofencesList();
					record(
						[{ EventType: EventTypeEnum.GEOFENCE_DELETION_SUCCESSFUL, Attributes: {} }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
				} catch (error) {
					record(
						[{ EventType: EventTypeEnum.GEOFENCE_DELETION_FAILED, Attributes: {} }],
						["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
					);
					errorHandler(error, t("error_handler__failed_delete_geofences.text") as string);
				} finally {
					setState({ isDeletingGeofence: false });
				}
			},
			evaluateGeofence: async (Position: Position, geofenceCollection?: string) => {
				try {
					await geofenceService.evaluateGeofence(Position, authStore.credentials!.identityId, geofenceCollection);
				} catch (error) {
					errorHandler(error, t("error_handler__failed_evaluate_geofences.text") as string);
				}
			},
			setIsAddingGeofence: (isAddingGeofence: boolean) => {
				setState({ isAddingGeofence });
			},
			setUnauthNotifications: (n: NotificationHistoryItemtype | undefined) => {
				setState(prevState => {
					if (n) {
						const exists = prevState.unauthNotifications.find(item => item.coordinates === n.coordinates);

						return !exists
							? { ...prevState, unauthNotifications: [...prevState.unauthNotifications, n] }
							: { ...prevState };
					} else {
						return { ...prevState, unauthNotifications: [] };
					}
				});
			},
			resetStore: () => {
				setState({ geofences: undefined });
				setInitial();
			}
		}),
		[setInitial, setState, geofenceService, authStore.credentials, t]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useAwsGeofence;

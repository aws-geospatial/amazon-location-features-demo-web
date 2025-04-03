/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { ListGeofenceResponseEntry } from "@aws-sdk/client-location";
import { useGeofenceService } from "@demo/services";
import { useAuthStore, useGeofenceStore } from "@demo/stores";
import { EventTypeEnum, NotificationHistoryItemtype } from "@demo/types";
import { record } from "@demo/utils/analyticsUtils";
import { errorHandler } from "@demo/utils/errorHandler";
import { useTranslation } from "react-i18next";

const useGeofence = () => {
	const store = useGeofenceStore();
	const { setInitial } = store;
	const { setState } = useGeofenceStore;
	const geofenceService = useGeofenceService();
	const authStore = useAuthStore();
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
			evaluateGeofence: async (Position: number[], geofenceCollection?: string) => {
				try {
					await geofenceService.evaluateGeofence(Position, authStore.credentials!.identityId, geofenceCollection);
				} catch (error) {
					errorHandler(error, t("error_handler__failed_evaluate_geofences.text") as string);
				}
			},
			setUnauthNotifications: (n: NotificationHistoryItemtype | undefined) => {
				setState(prevState => {
					if (n) {
						return { ...prevState, unauthNotifications: [...prevState.unauthNotifications, n] };
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

export default useGeofence;

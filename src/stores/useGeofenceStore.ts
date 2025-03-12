/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ListGeofenceResponseEntry } from "@aws-sdk/client-location";
import { IStateProps, NotificationHistoryItemtype } from "@demo/types";

import createStore from "./createStore";

export interface GeofenceStoreProps {
	isFetchingGeofences: boolean;
	geofences?: Array<ListGeofenceResponseEntry>;
	unauthNotifications: Array<NotificationHistoryItemtype>;
}

export const initialState: IStateProps<GeofenceStoreProps> = {
	isFetchingGeofences: false,
	unauthNotifications: []
};

export default createStore<GeofenceStoreProps>(initialState);

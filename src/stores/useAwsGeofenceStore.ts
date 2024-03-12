/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ListGeofenceResponseEntry } from "@aws-sdk/client-location";
import { IStateProps, NotificationHistoryItemtype } from "@demo/types";

import createStore from "./createStore";

export interface AwsGeofenceStoreProps {
	isFetchingGeofences: boolean;
	isCreatingGeofence: boolean;
	isDeletingGeofence: boolean;
	geofences?: Array<ListGeofenceResponseEntry>;
	isAddingGeofence: boolean;
	unauthNotifications: Array<NotificationHistoryItemtype>;
}

export const initialState: IStateProps<AwsGeofenceStoreProps> = {
	isFetchingGeofences: false,
	isCreatingGeofence: false,
	isDeletingGeofence: false,
	isAddingGeofence: false,
	unauthNotifications: []
};

export default createStore<AwsGeofenceStoreProps>(initialState);

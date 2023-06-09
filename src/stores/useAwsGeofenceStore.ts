/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { IStateProps } from "@demo/types";
import { ListGeofenceResponseEntry } from "aws-sdk/clients/location";

import createStore from "./createStore";

export interface AwsGeofenceStoreProps {
	isFetchingGeofences: boolean;
	isCreatingGeofence: boolean;
	isDeletingGeofence: boolean;
	geofences?: Array<ListGeofenceResponseEntry>;
	isAddingGeofence: boolean;
}

export const initialState: IStateProps<AwsGeofenceStoreProps> = {
	isFetchingGeofences: false,
	isCreatingGeofence: false,
	isDeletingGeofence: false,
	isAddingGeofence: false
};

export default createStore<AwsGeofenceStoreProps>(initialState);

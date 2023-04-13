/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { IStateProps, TrackerType } from "@demo/types";
import { Position } from "aws-sdk/clients/location";

import createStore from "./createStore";

export interface AwsTrackerStoreProps {
	isEditingRoute: boolean;
	trackerPoints?: Array<Position>;
	selectedTrackerType: TrackerType;
}

export const initialState: IStateProps<AwsTrackerStoreProps> = {
	isEditingRoute: false,
	selectedTrackerType: TrackerType.CAR
};

export default createStore<AwsTrackerStoreProps>(initialState);

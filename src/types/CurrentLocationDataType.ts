/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ViewPointType } from "./ViewPointType";

export type CurrentLocationDataType = {
	currentLocation?: ViewPointType;
	error?: GeolocationPositionError;
};

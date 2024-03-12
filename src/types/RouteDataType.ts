/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { CalculateRouteResponse } from "@aws-sdk/client-location";

import { TrackerType, TravelMode } from "./Enums";

export interface RouteDataType extends CalculateRouteResponse {
	travelMode: TravelMode | TrackerType;
}

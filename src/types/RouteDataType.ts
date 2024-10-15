/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { CalculateRoutesCommandOutput } from "@aws-sdk/client-georoutes";

import { TrackerType, TravelMode } from "./Enums";

export interface RouteDataType extends CalculateRoutesCommandOutput {
	travelMode: TravelMode | TrackerType;
}

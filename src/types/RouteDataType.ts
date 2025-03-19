/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { CalculateRoutesCommandOutput } from "@aws-sdk/client-geo-routes";

import { TravelMode } from "./Enums";

export interface RouteDataType extends CalculateRoutesCommandOutput {
	travelMode: TravelMode;
}

/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FeatureCollection, Polygon } from "@turf/turf";
import { Position } from "aws-sdk/clients/location";

import { CirclreDrawTypeEnum } from "./Enums";

export type CirclePropertiesType = {
	center: Position;
	isCircle: boolean;
	radiusInKm: number;
};

export type CircleDrawEventType = {
	features: Array<{
		geometry: {
			coordinates: Array<Position>;
			type: string;
		};
		id: string;
		properties: CirclePropertiesType;
		type: string;
	}>;
	type: CirclreDrawTypeEnum;
};

export type CircleFeatureType = FeatureCollection<Polygon, CirclePropertiesType>;

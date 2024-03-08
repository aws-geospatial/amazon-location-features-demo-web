/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FeatureCollection, Polygon } from "@turf/turf";

import { CirclreDrawTypeEnum } from "./Enums";

export type CirclePropertiesType = {
	center: number[];
	isCircle: boolean;
	radiusInKm: number;
};

export type CircleDrawEventType = {
	features: Array<{
		geometry: {
			coordinates: Array<number[]>;
			type: string;
		};
		id: string;
		properties: CirclePropertiesType;
		type: string;
	}>;
	type: CirclreDrawTypeEnum;
};

export type CircleFeatureType = FeatureCollection<Polygon, CirclePropertiesType>;

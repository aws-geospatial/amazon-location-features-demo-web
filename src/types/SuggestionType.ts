/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { GetPlaceCommandOutput } from "@aws-sdk/client-geoplaces";

export interface SuggestionType {
	id: string;
	queryId?: string;
	placeId?: string;
	label?: string;
	position?: number[];
	country?: string;
	region?: string;
	hash?: string;
	place?: GetPlaceCommandOutput;
}

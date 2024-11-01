/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Address } from "@aws-sdk/client-geo-places";

export interface SuggestionType {
	id: string;
	queryId?: string;
	placeId?: string;
	position?: number[];
	label?: string;
	address?: Address;
	country?: string;
	region?: string;
	hash?: string;
}

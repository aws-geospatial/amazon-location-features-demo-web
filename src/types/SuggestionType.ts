/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Place } from "aws-sdk/clients/location";

export interface SuggestionType {
	PlaceId?: string;
	Text?: string;
	Place?: Place;
	Distance?: number;
	Relevance?: number;
	Hash?: string;
}

/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ClustersType, IStateProps, SuggestionType, ViewPointType } from "@demo/types";
import { Double } from "aws-sdk/clients/location";

import createStore from "./createStore";

interface AwsPlaceStoreProps {
	isSearching: boolean;
	isFetchingPlaceData: boolean;
	bound?: Double[];
	clusters?: ClustersType;
	clusterZoom: number;
	precision: number;
	suggestions?: SuggestionType[];
	selectedMarker?: SuggestionType;
	hoveredMarker?: SuggestionType;
	marker?: ViewPointType;
	zoom: number;
}

const initialState: IStateProps<AwsPlaceStoreProps> = {
	isSearching: false,
	isFetchingPlaceData: false,
	zoom: 5,
	clusterZoom: 18,
	precision: 10
};

export default createStore<AwsPlaceStoreProps>(initialState);

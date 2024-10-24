/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ClustersType, IStateProps, SuggestionType, ViewPointType } from "@demo/types";

import createStore from "./createStore";

interface PlaceStoreProps {
	isSearching: boolean;
	isFetchingPlaceData: boolean;
	clusters?: ClustersType;
	clusterZoom: number;
	precision: number;
	suggestions?: SuggestionType[];
	selectedMarker?: SuggestionType;
	hoveredMarker?: SuggestionType;
	marker?: ViewPointType;
	zoom: number;
}

const initialState: IStateProps<PlaceStoreProps> = {
	isSearching: false,
	isFetchingPlaceData: false,
	zoom: 5,
	clusterZoom: 18,
	precision: 10
};

export default createStore<PlaceStoreProps>(initialState);

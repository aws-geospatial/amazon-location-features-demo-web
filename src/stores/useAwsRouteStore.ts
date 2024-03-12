/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { IStateProps, RouteDataType, SuggestionType } from "@demo/types";

import createStore from "./createStore";

interface AwsRouteStoreProps {
	isFetchingRoute: boolean;
	routePositions?: { from: number[] | undefined; to: number[] | undefined };
	routeData?: RouteDataType;
	directions?: { info: SuggestionType; isEsriLimitation: boolean };
}

const initialState: IStateProps<AwsRouteStoreProps> = {
	isFetchingRoute: false
};

export default createStore<AwsRouteStoreProps>(initialState);

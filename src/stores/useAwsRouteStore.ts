/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Position } from "aws-sdk/clients/location";

import createStore from "./createStore";

import { IStateProps, RouteDataType, RouteOptionsType, SuggestionType } from "../types";

interface AwsRouteStoreProps {
	isFetchingRoute: boolean;
	routePositions?: { from: Position | undefined; to: Position | undefined };
	routeData?: RouteDataType;
	directions?: { info: SuggestionType; isEsriLimitation: boolean };
	defaultRouteOptions: RouteOptionsType;
}

const initialState: IStateProps<AwsRouteStoreProps> = {
	isFetchingRoute: false,
	defaultRouteOptions: { avoidFerries: true, avoidTolls: true }
};

export default createStore<AwsRouteStoreProps>(initialState);

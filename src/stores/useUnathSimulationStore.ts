/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { IStateProps, SelectOption, TrackingHistoryType } from "@demo/types";

import createStore from "./createStore";

export const initialTrackingHistory: TrackingHistoryType = {
	bus_route_01: [],
	bus_route_02: [],
	bus_route_03: [],
	bus_route_04: [],
	bus_route_05: []
};
export const busRoutesDropdown = [
	{ value: "bus_route_01", label: "Bus 01 Robson" },
	{ value: "bus_route_02", label: "Bus 02 Davie" },
	{ value: "bus_route_03", label: "Bus 03 Victoria" },
	{ value: "bus_route_04", label: "Bus 04 Knight" },
	{ value: "bus_route_05", label: "Bus 05 UBC" }
];

export interface UnauthSimulationStoreProps {
	startSimulation: boolean;
	trackingHistory: TrackingHistoryType;
	selectedRoutes: SelectOption[];
	busSelectedValue: SelectOption;
	isNotifications: boolean;
	confirmCloseSimulation: boolean;
	isPlaying: boolean;
}

export const initialState: IStateProps<UnauthSimulationStoreProps> = {
	startSimulation: false,
	trackingHistory: initialTrackingHistory,
	selectedRoutes: [busRoutesDropdown[0]],
	busSelectedValue: busRoutesDropdown[0],
	isNotifications: false,
	confirmCloseSimulation: false,
	isPlaying: true
};

export default createStore<UnauthSimulationStoreProps>(initialState);

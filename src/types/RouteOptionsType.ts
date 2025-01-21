/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export type RouteOptionsType = {
    avoidTolls: boolean;
    avoidFerries: boolean;
    avoidCarShuttleTrains: boolean;
    avoidControlledAccessHighways: boolean;
    avoidDirtRoads: boolean;
    avoidSeasonalClosure: boolean;
    avoidTollTransponders: boolean;
    avoidTruckRoadTypes: string[];
    avoidTunnels: boolean;
    avoidUTurns: boolean;
    [key: string]: any;  // Add index signature to allow string keys
};

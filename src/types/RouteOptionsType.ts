/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export type RouteOptionsType = {
	avoidTolls: boolean;
	avoidFerries: boolean;
	avoidDirtRoads: boolean;
	avoidUTurns: boolean;
	avoidTunnels: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any; // Add index signature to allow string keys
};

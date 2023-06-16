/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { lazy } from "react";

import { appConfig } from "@demo/core/constants";
import { Navigate, RouteObject } from "react-router-dom";

const { ERROR_BOUNDARY, DEFAULT, DEMO } = appConfig.ROUTES;

const DemoPage = lazy(() => import("@demo/atomicui/pages/DemoPage").then(res => ({ default: res.DemoPage })));

const RouteChunks: RouteObject[] = [
	{
		path: DEFAULT,
		element: <Navigate to={DEMO} />
	},
	{
		path: DEMO,
		element: <DemoPage />,
		errorElement: <Navigate to={ERROR_BOUNDARY} />
	}
];

export default RouteChunks;

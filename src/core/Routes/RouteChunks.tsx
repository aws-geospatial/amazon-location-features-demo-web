/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { lazy } from "react";

import appConfig from "@demo/core/constants/appConfig";
import { Navigate, RouteObject } from "react-router-dom";

const { ERROR_BOUNDARY, DEFAULT, DEMO, SHOWCASE } = appConfig.ROUTES;

const ShowcasePage = lazy(() =>
	import("@demo/atomicui/pages/ShowcasePage").then(res => ({ default: res.ShowcasePage }))
);

const RouteChunks: RouteObject[] = [
	{
		path: DEFAULT,
		element: <Navigate to={SHOWCASE} />
	},
	{
		path: DEMO,
		element: <Navigate to={SHOWCASE} />
	},
	{
		path: SHOWCASE,
		element: <ShowcasePage />,
		errorElement: <Navigate to={ERROR_BOUNDARY} />
	}
];

export default RouteChunks;

/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { Geo } from "aws-amplify";

const useAmplifyMapService = () => {
	return useMemo(
		() => ({
			getDefaultMap: () => Geo.getDefaultMap(),
			getAvailableMaps: () => Geo.getAvailableMaps()
		}),
		[]
	);
};

export default useAmplifyMapService;

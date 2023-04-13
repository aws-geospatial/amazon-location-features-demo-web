/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useAwsTrackerStore } from "@demo/stores";
import { TrackerType } from "@demo/types";
import { Position } from "aws-sdk/clients/location";

const useAwsTracker = () => {
	const store = useAwsTrackerStore();
	const { setInitial } = store;
	const { setState } = useAwsTrackerStore;

	const methods = useMemo(
		() => ({
			setIsEditingRoute: (isEditingRoute: boolean) => {
				setState({ isEditingRoute });
			},
			setTrackerPoints: (trackerPoint?: Position) => {
				if (trackerPoint) {
					setState(s => ({
						trackerPoints: s.trackerPoints?.length ? [...s.trackerPoints, trackerPoint] : [trackerPoint]
					}));
				} else {
					setState({ trackerPoints: undefined });
				}
			},
			setSelectedTrackerType: (selectedTrackerType: TrackerType) => {
				setState({ selectedTrackerType });
			},
			resetStore: () => {
				setState({ trackerPoints: undefined });
				setInitial();
			}
		}),
		[setInitial, setState]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useAwsTracker;

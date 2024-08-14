/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useTrackerStore } from "@demo/stores";
import { TrackerType } from "@demo/types";

const useTracker = () => {
	const store = useTrackerStore();
	const { setInitial } = store;
	const { setState } = useTrackerStore;

	const methods = useMemo(
		() => ({
			setIsEditingRoute: (isEditingRoute: boolean) => {
				setState({ isEditingRoute });
			},
			setTrackerPoints: (trackerPoint?: number[]) => {
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

export default useTracker;

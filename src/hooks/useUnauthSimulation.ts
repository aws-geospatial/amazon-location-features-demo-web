/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { useUnathSimulationStore } from "@demo/stores";
import { SelectOption, TrackingHistoryType } from "@demo/types";

const useUnauthSimulation = () => {
	const store = useUnathSimulationStore();
	const { setInitial } = store;
	const { setState } = useUnathSimulationStore;

	const methods = useMemo(
		() => ({
			setStartSimulation: (startSimulation: boolean) => setState({ startSimulation }),
			setTrackingHistory: (trackingHistory: TrackingHistoryType) => setState({ trackingHistory }),
			setSelectedRoutes: (selectedRoutes: SelectOption[]) => setState({ selectedRoutes }),
			setBusSelectedValue: (busSelectedValue: SelectOption) => setState({ busSelectedValue }),
			setIsNotifications: (isNotifications: boolean) => setState({ isNotifications }),
			setConfirmCloseSimulation: (confirmCloseSimulation: boolean) => setState({ confirmCloseSimulation }),
			setIsPlaying: (isPlaying: boolean) => setState({ isPlaying }),
			setHideGeofenceTrackerShortcut: (hideGeofenceTrackerShortcut: boolean) =>
				setState({ hideGeofenceTrackerShortcut }),
			resetStore: () => {
				setInitial();
			}
		}),
		[setInitial, setState]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default useUnauthSimulation;

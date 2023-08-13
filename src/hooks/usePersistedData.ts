/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useMemo } from "react";

import { usePersistedDataStore } from "@demo/stores";
import { RouteOptionsType, SettingOptionEnum } from "@demo/types";

const usePersistedData = () => {
	const store = usePersistedDataStore();
	const { setInitial } = store;
	const { setState } = usePersistedDataStore;

	const methods = useMemo(
		() => ({
			setSettingsOptions: (settingsOptions: SettingOptionEnum) => {
				setState({ settingsOptions });
			},
			setShowAppDownloadNotification: (showAppDownloadNotification: boolean) => {
				setState({ showAppDownloadNotification });
			},
			setDoNotAskGrabDisclaimerModal: (doNotAskGrabDisclaimerModal: boolean) => {
				setState({ doNotAskGrabDisclaimerModal });
			},
			setDoNotAskOpenDataDisclaimerModal: (doNotAskOpenDataDisclaimerModal: boolean) => {
				setState({ doNotAskOpenDataDisclaimerModal });
			},
			setShowWelcomeModal: (showWelcomeModal: boolean) => {
				setState({ showWelcomeModal });
			},
			setDefaultRouteOptions: (defaultRouteOptions: RouteOptionsType) => {
				setState({ defaultRouteOptions });
			},
			resetStore: () => {
				setInitial();
			}
		}),
		[setInitial, setState]
	);

	return useMemo(() => ({ ...methods, ...store }), [methods, store]);
};

export default usePersistedData;

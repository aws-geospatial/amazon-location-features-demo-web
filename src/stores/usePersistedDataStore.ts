/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { appConfig } from "@demo/core/constants";
import { IStateProps, RouteOptionsType, SettingOptionEnum } from "@demo/types";

import createStore from "./createStore";

const {
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, PERSISTED_DATA }
} = appConfig;
const localStorageKey = `${LOCAL_STORAGE_PREFIX}${PERSISTED_DATA}`;

interface PersistedDataStoreProps {
	showAppDownloadNotification: boolean;
	showWelcomeModal: boolean;
	doNotAskGrabDisclaimerModal: boolean;
	doNotAskOpenDataDisclaimerModal: boolean;
	defaultRouteOptions: RouteOptionsType;
	settingsOptions: SettingOptionEnum;
}

const initialState: IStateProps<PersistedDataStoreProps> = {
	showAppDownloadNotification: true,
	showWelcomeModal: true,
	doNotAskGrabDisclaimerModal: true,
	doNotAskOpenDataDisclaimerModal: true,
	defaultRouteOptions: { avoidFerries: true, avoidTolls: true },
	settingsOptions: SettingOptionEnum.UNITS
};

export default createStore<PersistedDataStoreProps>(initialState, true, localStorageKey);

/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import appConfig from "@demo/core/constants/appConfig";
import { IStateProps, RouteOptionsType } from "@demo/types";

import createStore from "./createStore";

const {
	GLOBAL_CONSTANTS: { LOCAL_STORAGE_PREFIX },
	PERSIST_STORAGE_KEYS: { PERSISTED_DATA }
} = appConfig;
const localStorageKey = `${LOCAL_STORAGE_PREFIX}${PERSISTED_DATA}`;

interface PersistedDataStoreProps {
	showAppDownloadNotification: boolean;
	showWelcomeModal: boolean;
	defaultRouteOptions: RouteOptionsType;
}

const initialState: IStateProps<PersistedDataStoreProps> = {
	showAppDownloadNotification: true,
	showWelcomeModal: true,
	defaultRouteOptions: { avoidFerries: true, avoidTolls: true }
};

export default createStore<PersistedDataStoreProps>(initialState, true, localStorageKey);

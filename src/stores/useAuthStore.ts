/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { appConfig } from "@demo/core/constants";
import { BaseValues, CognitoIdentityCredentials, IStateProps } from "@demo/types";

import createStore from "./createStore";

const {
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, AUTH_DATA }
} = appConfig;
const localStorageKey = `${LOCAL_STORAGE_PREFIX}${AUTH_DATA}`;

export interface AuthStoreProps {
	apiKey?: string;
	credentials?: CognitoIdentityCredentials;
	baseValues?: BaseValues;
	autoRegion: boolean;
}

export const initialState: IStateProps<AuthStoreProps> = {
	autoRegion: true
};

export default createStore<AuthStoreProps>(initialState, true, localStorageKey);

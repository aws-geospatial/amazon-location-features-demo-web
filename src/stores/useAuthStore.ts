/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { appConfig } from "@demo/core/constants";
import { AuthTokensType, BaseValues, CognitoIdentityCredentials, IStateProps, UserProvidedValues } from "@demo/types";

import createStore from "./createStore";

const {
	ENV: { CF_TEMPLATE },
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, AUTH_DATA }
} = appConfig;
const localStorageKey = `${LOCAL_STORAGE_PREFIX}${AUTH_DATA}`;

export interface AuthStoreProps {
	apiKey?: string;
	credentials?: CognitoIdentityCredentials;
	authTokens?: AuthTokensType;
	baseValues?: BaseValues;
	userProvidedValues?: UserProvidedValues;
	autoRegion: boolean;
	stackRegion?: { value: string; label: string };
	cloudFormationLink: string;
}

export const initialState: IStateProps<AuthStoreProps> = {
	autoRegion: true,
	cloudFormationLink: CF_TEMPLATE
};

export default createStore<AuthStoreProps>(initialState, true, localStorageKey);

/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ICredentials } from "@aws-amplify/core";

import { appConfig } from "@demo/core/constants";
import { AuthTokensType, IStateProps } from "@demo/types";

import createStore from "./createStore";

const {
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, AMPLIFY_AUTH_DATA }
} = appConfig;
const localStorageKey = `${LOCAL_STORAGE_PREFIX}${AMPLIFY_AUTH_DATA}`;

export interface AmplifyAuthStoreProps {
	credentials?: ICredentials;
	authTokens?: AuthTokensType;
	isLoading: boolean;
	isUserAwsAccountConnected: boolean;
	identityPoolId?: string;
	region?: string;
	userDomain?: string;
	userPoolClientId?: string;
	userPoolId?: string;
	webSocketUrl?: string;
}

export const initialState: IStateProps<AmplifyAuthStoreProps> = {
	isLoading: false,
	isUserAwsAccountConnected: false
};

export default createStore<AmplifyAuthStoreProps>(initialState, true, localStorageKey);

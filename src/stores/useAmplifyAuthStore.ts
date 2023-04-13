/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { ICredentials } from "@aws-amplify/core";

import appConfig from "@demo/core/constants/appConfig";
import { AuthTokensType, IStateProps } from "@demo/types";

import createStore from "./createStore";

const {
	GLOBAL_CONSTANTS: { LOCAL_STORAGE_PREFIX },
	PERSIST_STORAGE_KEYS: { AMPLIFY_AUTH_DATA }
} = appConfig;
const localStorageKey = `${LOCAL_STORAGE_PREFIX}${AMPLIFY_AUTH_DATA}`;

export interface AmplifyAuthStoreProps {
	credentials?: ICredentials;
	authTokens?: AuthTokensType;
	isLoading: boolean;
	isUserAwsAccountConnected: boolean;
	identityPoolId: string;
	region: string;
	userDomain?: string;
	userPoolClientId?: string;
	userPoolId?: string;
	webSocketUrl?: string;
}

export const initialState: IStateProps<AmplifyAuthStoreProps> = {
	isLoading: false,
	isUserAwsAccountConnected: false,
	identityPoolId: import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID,
	region: import.meta.env.VITE_AWS_REGION
};

export default createStore<AmplifyAuthStoreProps>(initialState, true, localStorageKey);

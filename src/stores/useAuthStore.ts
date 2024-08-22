/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { MapAuthenticationOptions } from "@aws/amazon-location-utilities-auth-helper";
import { appConfig } from "@demo/core/constants";
import { AuthTokensType, CognitoIdentityCredentials, IStateProps } from "@demo/types";

import createStore from "./createStore";

const {
	ENV: { CF_TEMPLATE },
	PERSIST_STORAGE_KEYS: { LOCAL_STORAGE_PREFIX, AUTH_DATA }
} = appConfig;
const localStorageKey = `${LOCAL_STORAGE_PREFIX}${AUTH_DATA}`;

export interface AuthStoreProps {
	credentials?: CognitoIdentityCredentials;
	authTokens?: AuthTokensType;
	isUserAwsAccountConnected: boolean;
	identityPoolId?: string;
	region?: string;
	userDomain?: string;
	userPoolClientId?: string;
	userPoolId?: string;
	webSocketUrl?: string;
	autoRegion: boolean;
	stackRegion?: { value: string; label: string };
	cloudFormationLink: string;
	authOptions?: MapAuthenticationOptions;
}

export const initialState: IStateProps<AuthStoreProps> = {
	isUserAwsAccountConnected: false,
	autoRegion: true,
	cloudFormationLink: CF_TEMPLATE
};

export default createStore<AuthStoreProps>(initialState, true, localStorageKey);

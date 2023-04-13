/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export type AuthTokensType = {
	id_token: string;
	access_token: string;
	expires_in: string;
	token_type: string;
	state: string;
};

export type ConnectFormValuesType = {
	IdentityPoolId: string;
	UserDomain: string;
	UserPoolClientId: string;
	UserPoolId: string;
	WebSocketUrl: string;
};

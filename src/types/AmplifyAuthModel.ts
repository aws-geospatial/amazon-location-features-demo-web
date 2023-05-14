/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export type AuthTokensType = {
	code: string;
	state: string;
};

export type ConnectFormValuesType = {
	IdentityPoolId: string;
	UserDomain: string;
	UserPoolClientId: string;
	UserPoolId: string;
	WebSocketUrl: string;
};

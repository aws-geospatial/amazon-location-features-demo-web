/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export type CognitoIdentityCredentials = {
	accessKeyId: string;
	expiration?: Date;
	identityId: string;
	secretAccessKey: string;
	sessionToken?: string;
	authenticated?: boolean;
};

export type AuthTokensType = {
	access_token: string;
	expires_in: number;
	id_token: string;
	refresh_token: string;
	token_type: string;
};

export type ConnectFormValuesType = {
	IdentityPoolId: string;
	UserDomain: string;
	UserPoolClientId: string;
	UserPoolId: string;
	WebSocketUrl: string;
};

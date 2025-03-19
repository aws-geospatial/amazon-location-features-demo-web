/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export interface BaseValues {
	identityPoolId: string;
	region: string;
	webSocketUrl: string;
}

export type CognitoIdentityCredentials = {
	accessKeyId: string;
	expiration?: Date;
	identityId: string;
	secretAccessKey: string;
	sessionToken?: string;
	authenticated?: boolean;
};

/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

const validator = {
	isUrlAnImage: (url: string) => url.match(/\.(jpeg|jpg|gif|png)$/) != null
};

export { validator };

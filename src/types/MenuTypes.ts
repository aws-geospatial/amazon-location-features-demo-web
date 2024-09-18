/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export type MenuItem = {
	label: string;
	link: string;
	iconBeforeLink?: string;
	iconContainerClass?: string;
	isExternalLink?: boolean;
	subMenu?: MenuItem[];
};

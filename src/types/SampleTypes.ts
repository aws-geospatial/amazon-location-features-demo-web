/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export type SampleDetailsType = {
	id: string;
	title: string;
	imageSource?: string;
	publishedOn?: string;
	updatedOn?: string;
	tags?: string[];
	tabs?: {
		title: string;
		content: string;
	}[];
	bodyText?: string;
	clone?: string;
	deploy?: string;
	testing?: string;
	tabsTitle?: string;
	cloudformationUrl?: string;
	setup?: string;
	cleanup?: string;
	githubLink?: string;
};

export type SampleListFilter = {
	searchText?: string;
	features?: string[];
	language?: string[];
	platform?: string[];
};

export type SampleList = {
	id: string;
	title: string;
	imageSource: string;
	brief: string;
	tags: string[];
}[];

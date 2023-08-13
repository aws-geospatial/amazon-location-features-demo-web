/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import IconCodeMenu from "@demo/assets/icons/icon-code-menu-icon.svg";
import IconCompassMenu from "@demo/assets/icons/icon-compass-menu-icon.svg";
// import IconCubesMenu from "@demo/assets/icons/icon-cubes-menu-icon.svg";
import IconPlayMenu from "@demo/assets/icons/icon-play-menu-icon.svg";

import appConfig from "@demo/core/constants/appConfig";

const {
	ENV: {
		// APPLE_APP_STORE_LINK,
		GOOGLE_PLAY_STORE_LINK
	},
	ROUTES: {
		OVERVIEW,
		// PRODUCT,
		DEMO,
		SAMPLES
	}
} = appConfig;

const marketingMenuOptionsData = [
	{
		label: "header__overview.text",
		link: OVERVIEW,
		iconBeforeLink: IconCompassMenu,
		iconContainerClass: "menu-item-icon"
	},
	// {
	// 	label: "header__product.text",
	// 	link: PRODUCT,
	// 	iconBeforeLink: IconCubesMenu,
	// 	iconContainerClass: "menu-item-icon"
	// },
	{
		label: "demo.text",
		link: DEMO,
		iconBeforeLink: IconPlayMenu,
		iconContainerClass: "menu-item-icon",
		subMenu: [
			{
				label: "web.text",
				link: DEMO,
				isExternalLink: true
			},
			// {
			// 	label: "ios.text",
			// 	link: APPLE_APP_STORE_LINK
			// },
			{
				label: "android.text",
				link: GOOGLE_PLAY_STORE_LINK
			}
		]
	},
	{
		label: "samples.text",
		link: SAMPLES,
		iconBeforeLink: IconCodeMenu,
		iconContainerClass: "menu-item-icon"
	}
];

export default marketingMenuOptionsData;

/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import IconCodeMenu from "@demo/assets/icons/icon-code-menu-icon.svg";
import IconCompassMenu from "@demo/assets/icons/icon-compass-menu-icon.svg";
// import IconCubesMenu from "assets/icons/icon-cubes-menu-icon.svg";
import IconPlayMenu from "@demo/assets/icons/icon-play-menu-icon.svg";

import appConfig from "./appConfig";

const {
	ENV: { APPLE_APP_STORE_LINK, GOOGLE_PLAY_STORE_LINK },
	ROUTES: {
		OVERVIEW,
		// PRODUCT,
		DEMO,
		SAMPLES
	}
} = appConfig;

const marketingMenuOptions = [
	{
		label: "Overview",
		link: OVERVIEW,
		iconBeforeLink: IconCompassMenu,
		iconContainerClass: "menu-item-icon"
	},
	// {
	// 	label: "Product",
	// 	link: PRODUCT,
	// 	iconBeforeLink: IconCubesMenu,
	// 	iconContainerClass: "menu-item-icon"
	// },
	{
		label: "Demo",
		link: DEMO,
		iconBeforeLink: IconPlayMenu,
		iconContainerClass: "menu-item-icon",
		subMenu: [
			{
				label: "Web",
				link: DEMO
			},
			{
				label: "iOS",
				link: APPLE_APP_STORE_LINK
			},
			{
				label: "Android",
				link: GOOGLE_PLAY_STORE_LINK
			}
		]
	},
	{
		label: "Samples",
		link: SAMPLES,
		iconBeforeLink: IconCodeMenu,
		iconContainerClass: "menu-item-icon"
	}
];

const sidebarData = marketingMenuOptions.filter(v => v.label !== "Demo");

export default sidebarData;

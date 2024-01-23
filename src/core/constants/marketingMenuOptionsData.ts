/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import IconCodeMenu from "@demo/assets/icons/icon-code-menu-icon.svg";
import IconCompassMenu from "@demo/assets/icons/icon-compass-menu-icon.svg";
import IconDollarSolid from "@demo/assets/icons/icon-dollar-solid.svg";
// import IconCubesMenu from "@demo/assets/icons/icon-cubes-menu-icon.svg";
import IconPlayMenu from "@demo/assets/icons/icon-play-menu-icon.svg";
import IconSwap from "@demo/assets/icons/icon-swap.svg";

import appConfig from "@demo/core/constants/appConfig";

const {
	ENV: {
		// APPLE_APP_STORE_LINK,
		GOOGLE_PLAY_STORE_LINK,
		MIGRATE_FROM_GOOGLE_MAPS_PAGE,
		FEATURE_COMPARISON_PAGE,
		MIGRATE_A_WEB_APP_PAGE,
		MIGRATE_AN_ANDROID_APP_PAGE,
		MIGRATE_AN_IOS_APP_PAGE,
		MIGRATE_A_WEB_SERVICE_PAGE,
		PRICING_PAGE
	},
	ROUTES: {
		OVERVIEW,
		// PRODUCT,
		DEMO,
		SAMPLES,
		MIGRATE_FROM_GOOGLE_MAPS,
		FEATURE_COMPARISON,
		MIGRATE_A_WEB_APP,
		MIGRATE_AN_ANDROID_APP,
		MIGRATE_AN_IOS_APP,
		MIGRATE_A_WEB_SERVICE,
		PRICING
	}
} = appConfig;

type MenuItem = {
	label: string;
	link: string;
	iconBeforeLink?: string;
	iconContainerClass?: string;
	isExternalLink?: boolean;
	subMenu?: MenuItem[];
};

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

let conditionalMenuOptions = [
	{
		label: "migration.text",
		link: MIGRATE_FROM_GOOGLE_MAPS,
		iconBeforeLink: IconSwap,
		iconContainerClass: "menu-item-icon",
		isExternalLink: false,
		subMenu: [
			{
				label: "migrate_from_google_maps.text",
				link: MIGRATE_FROM_GOOGLE_MAPS,
				isExternalLink: false
			},
			{
				label: "feature_comparison.text",
				link: FEATURE_COMPARISON,
				isExternalLink: false
			},
			{
				label: "migrate_a_web_app.text",
				link: MIGRATE_A_WEB_APP,
				isExternalLink: false
			},
			{
				label: "migrate_an_android_app.text",
				link: MIGRATE_AN_ANDROID_APP,
				isExternalLink: false
			},
			{
				label: "migrate_an_ios_app.text",
				link: MIGRATE_AN_IOS_APP,
				isExternalLink: false
			},
			{
				label: "migrate_a_web_service.text",
				link: MIGRATE_A_WEB_SERVICE,
				isExternalLink: false
			}
		]
	},
	{
		label: "pricing.text",
		link: PRICING,
		iconBeforeLink: IconDollarSolid,
		iconContainerClass: "menu-item-icon",
		isExternalLink: false
	}
];

const envMapping = {
	[MIGRATE_FROM_GOOGLE_MAPS]: MIGRATE_FROM_GOOGLE_MAPS_PAGE,
	[FEATURE_COMPARISON]: FEATURE_COMPARISON_PAGE,
	[MIGRATE_A_WEB_APP]: MIGRATE_A_WEB_APP_PAGE,
	[MIGRATE_AN_ANDROID_APP]: MIGRATE_AN_ANDROID_APP_PAGE,
	[MIGRATE_AN_IOS_APP]: MIGRATE_AN_IOS_APP_PAGE,
	[MIGRATE_A_WEB_SERVICE]: MIGRATE_A_WEB_SERVICE_PAGE,
	[PRICING]: PRICING_PAGE
};

const shouldIncludeMenuItem = (menuItem: MenuItem) => !!parseInt(envMapping[menuItem?.link]);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
conditionalMenuOptions = conditionalMenuOptions
	.map(object => {
		const filteredSubMenu = object.subMenu ? object.subMenu.filter(shouldIncludeMenuItem) : undefined;
		return {
			...object,
			link: filteredSubMenu && filteredSubMenu.length > 0 ? filteredSubMenu[0].link : object.link,
			subMenu: filteredSubMenu
		};
	})
	.filter(shouldIncludeMenuItem);

export default [...marketingMenuOptionsData, ...conditionalMenuOptions];

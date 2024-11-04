/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import IconCodeMenu from "@demo/assets/svgs/icon-code-menu-icon.svg";
import IconDollarSolid from "@demo/assets/svgs/icon-dollar-solid.svg";
import IconSwap from "@demo/assets/svgs/icon-swap.svg";

import appConfig from "@demo/core/constants/appConfig";
import { MenuItem } from "@demo/types";

const {
	ENV: {
		MIGRATE_FROM_GOOGLE_MAPS_PAGE,
		MIGRATE_A_WEB_APP_PAGE,
		MIGRATE_AN_ANDROID_APP_PAGE,
		MIGRATE_AN_IOS_APP_PAGE,
		MIGRATE_A_WEB_SERVICE_PAGE,
		PRICING_PAGE,
		SHOW_NEW_NAVIGATION
	},
	ROUTES: {
		DEMO,
		SAMPLES,
		MIGRATE_FROM_GOOGLE_MAPS,
		MIGRATE_A_WEB_APP,
		MIGRATE_AN_ANDROID_APP,
		MIGRATE_AN_IOS_APP,
		MIGRATE_A_WEB_SERVICE,
		PRICING
	},
	LINKS: {
		LEARN_MORE_URL,
		AWS_LOCATION_MAPS_URL,
		AWS_LOCATION_PLACES_URL,
		AWS_LOCATION_ROUTES_URL,
		AWS_LOCATION_GENFENCE_AND_TRACKERS_URL,
		AWS_GETTING_STARTED_URL,
		AWS_PRICING_URL,
		AWS_FAQ_URL,
		AWS_LOCATION_INDUSTRY_URL,
		AWS_LOCATION_TRANSPORTATION_AND_LOGISTICS_URL,
		AWS_LOCATION_FINANCIAL_SERVICE_URL,
		AWS_LOCATION_HEALTHCARE_URL,
		AWS_LOCATION_RETAILS_URL,
		AWS_LOCATION_TRAVEL_AND_HOSPITALITY_URL,
		AWS_LOCATION_RESOURCES_URL,
		AWS_LOCATION_CUSTOMERS_URL,
		AMAZON_LOCATION_DOCUMENTATION_URL
	}
} = appConfig;

let marketingMenuOptionsData: MenuItem[];

const routeToEnvMapping = {
	[MIGRATE_FROM_GOOGLE_MAPS]: MIGRATE_FROM_GOOGLE_MAPS_PAGE,
	[MIGRATE_A_WEB_APP]: MIGRATE_A_WEB_APP_PAGE,
	[MIGRATE_AN_ANDROID_APP]: MIGRATE_AN_ANDROID_APP_PAGE,
	[MIGRATE_AN_IOS_APP]: MIGRATE_AN_IOS_APP_PAGE,
	[MIGRATE_A_WEB_SERVICE]: MIGRATE_A_WEB_SERVICE_PAGE,
	[PRICING]: PRICING_PAGE
};

const shouldIncludeMenuItem = ({ link }: MenuItem) => (link in routeToEnvMapping ? routeToEnvMapping[link] : true);

if (!SHOW_NEW_NAVIGATION) {
	marketingMenuOptionsData = [
		{
			label: "samples.text",
			link: SAMPLES,
			iconBeforeLink: IconCodeMenu,
			iconContainerClass: "menu-item-icon",
			isExternalLink: false
		},
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
} else {
	marketingMenuOptionsData = [
		{
			label: "samples.text",
			link: SAMPLES,
			iconBeforeLink: IconCodeMenu,
			iconContainerClass: "menu-item-icon",
			isExternalLink: false
		},
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
			label: "header__overview.text",
			link: LEARN_MORE_URL,
			iconBeforeLink: IconCodeMenu,
			iconContainerClass: "menu-item-icon",
			isExternalLink: false
		},
		{
			label: "header__product.text",
			link: AWS_LOCATION_MAPS_URL,
			iconBeforeLink: IconCodeMenu,
			iconContainerClass: "menu-item-icon",
			isExternalLink: false,
			subMenu: [
				{
					label: "maps.text",
					link: AWS_LOCATION_MAPS_URL,
					isExternalLink: false
				},
				{
					label: "places.text",
					link: AWS_LOCATION_PLACES_URL,
					isExternalLink: false
				},
				{
					label: "routes.text",
					link: AWS_LOCATION_ROUTES_URL,
					isExternalLink: false
				},
				{
					label: "geofences_and_trackers.text",
					link: AWS_LOCATION_GENFENCE_AND_TRACKERS_URL,
					isExternalLink: false
				}
			]
		},
		{
			label: "industry.text",
			link: AWS_LOCATION_INDUSTRY_URL,
			iconBeforeLink: IconCodeMenu,
			iconContainerClass: "menu-item-icon",
			isExternalLink: false,
			subMenu: [
				{
					label: "transportation_and_logistics.text",
					link: AWS_LOCATION_TRANSPORTATION_AND_LOGISTICS_URL,
					isExternalLink: false
				},
				{
					label: "financial_service.text",
					link: AWS_LOCATION_FINANCIAL_SERVICE_URL,
					isExternalLink: false
				},
				{
					label: "healthcare.text",
					link: AWS_LOCATION_HEALTHCARE_URL,
					isExternalLink: false
				},
				{
					label: "retails.text",
					link: AWS_LOCATION_RETAILS_URL,
					isExternalLink: false
				},
				{
					label: "travel_and_hospitality.text",
					link: AWS_LOCATION_TRAVEL_AND_HOSPITALITY_URL,
					isExternalLink: false
				}
			]
		},
		{
			label: "footer__getting_started.text",
			link: AWS_GETTING_STARTED_URL,
			iconBeforeLink: IconCodeMenu,
			iconContainerClass: "menu-item-icon",
			isExternalLink: false
		},
		{
			label: "pricing.text",
			link: AWS_PRICING_URL,
			iconBeforeLink: IconDollarSolid,
			iconContainerClass: "menu-item-icon",
			isExternalLink: false
		},
		{
			label: "resources.text",
			link: AWS_LOCATION_RESOURCES_URL,
			iconBeforeLink: IconCodeMenu,
			iconContainerClass: "menu-item-icon",
			isExternalLink: false,
			subMenu: [
				{
					label: "footer__faq.text",
					link: AWS_FAQ_URL,
					isExternalLink: false
				},
				{
					label: "customers.text",
					link: AWS_LOCATION_CUSTOMERS_URL,
					isExternalLink: false
				},
				{
					label: "documentation.text",
					link: AMAZON_LOCATION_DOCUMENTATION_URL,
					isExternalLink: false
				},
				{
					label: "demo.text",
					link: DEMO,
					isExternalLink: false
				},
				{
					label: "sample_applications.text",
					link: SAMPLES,
					isExternalLink: false
				}
			]
		}
	];
}

marketingMenuOptionsData = marketingMenuOptionsData
	.map(object => {
		const filteredSubMenu = object.subMenu ? object.subMenu.filter(shouldIncludeMenuItem) : undefined;

		return {
			...object,
			link: filteredSubMenu && filteredSubMenu.length > 0 ? filteredSubMenu[0].link : object.link,
			subMenu: filteredSubMenu
		};
	})
	.filter(shouldIncludeMenuItem);

export default [...marketingMenuOptionsData];

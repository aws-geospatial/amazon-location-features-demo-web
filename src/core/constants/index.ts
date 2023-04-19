/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import IconCodeMenuIcon from "@demo/assets/icons/icon-code-menu-icon.svg";
import IconCompassMenuIcon from "@demo/assets/icons/icon-compass-menu-icon.svg";
// import IconCubesMenuIcon from "@demo/assets/icons/icon-cubes-menu-icon.svg";

import IconPlayMenuIcon from "@demo/assets/icons/icon-play-menu-icon.svg";
import IconPoweredByAws from "@demo/assets/icons/icon-powered-by-aws.svg";
import IconTwitch from "@demo/assets/icons/icon-twitch.svg";
import IconTwitter from "@demo/assets/icons/icon-twitter-solid.svg";
import IconYoutube from "@demo/assets/icons/icon-youtube.svg";
import appConfig from "@demo/core/constants/appConfig";

const {
	ROUTES: {
		SHOWCASE,
		// PRODUCT,
		OVERVIEW,
		SAMPLES,
		HELP
	},
	AMAZON_LOCATION_BLOGS,
	AMAZON_LOCATION_NEW,
	AMAZON_LOCATION_GIT,
	AWS_TERMS_AND_CONDITIONS,
	APPLE_APP_STORE_LINK,
	GOOGLE_PLAY_STORE_LINK
} = appConfig;

export const userAgent = {
	IOS: "IOS",
	Android: "Android"
};

export const marketingMenuOptions = [
	{
		label: "Overview",
		link: OVERVIEW,
		iconBeforeLink: IconCompassMenuIcon,
		iconContainerClass: "menu-item-icon"
	},
	// {
	// 	label: "Product",
	// 	link: PRODUCT,
	// 	iconBeforeLink: IconCubesMenuIcon,
	// 	iconContainerClass: "menu-item-icon"
	// },
	{
		label: "Showcase",
		link: SHOWCASE,
		iconBeforeLink: IconPlayMenuIcon,
		iconContainerClass: "menu-item-icon",
		subMenu: [
			{
				label: "Web",
				link: SHOWCASE
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
		iconBeforeLink: IconCodeMenuIcon,
		iconContainerClass: "menu-item-icon"
	}
];

export const sideBarMenuOptions = marketingMenuOptions.filter(v => v.label !== "Showcase");

export const footerOptions = {
	menuGroupPrimary: [
		{
			label: "Amazon Location",
			menu: [
				{
					label: "Learn About Amazon Location",
					link: "https://aws.amazon.com/location/"
				},
				{
					label: "Getting Started",
					link: "https://aws.amazon.com/location/getting-started/"
				},
				{
					label: "FAQ",
					link: "https://aws.amazon.com/location/faqs/"
				},
				{
					label: "Pricing",
					link: "https://aws.amazon.com/location/pricing/"
				},
				{
					label: "Blogs",
					link: AMAZON_LOCATION_BLOGS
				},
				{
					label: "What’s new",
					link: AMAZON_LOCATION_NEW
				}
			]
		},
		{
			label: "Developers",
			menu: [
				{
					label: "Developer Guides",
					link: "https://docs.aws.amazon.com/location/latest/developerguide/welcome.html"
				},
				{
					label: "Workshop",
					link: "https://catalog.workshops.aws/amazon-location-101/en-US"
				},
				{
					label: "Console",
					link: "https://console.aws.amazon.com/location/"
				},
				{
					label: "Learn Maps",
					link: "https://docs.aws.amazon.com/location/latest/developerguide/map-concepts.html"
				},
				{
					label: "Learn Places",
					link: "https://docs.aws.amazon.com/location/latest/developerguide/places-concepts.html"
				},
				{
					label: "Learn Routes",
					link: "https://docs.aws.amazon.com/location/latest/developerguide/route-concepts.html"
				},
				{
					label: "Learn Geofences",
					link: "https://docs.aws.amazon.com/location/latest/developerguide/geofence-tracker-concepts.html"
				},
				{
					label: "Learn Trackers",
					link: "https://docs.aws.amazon.com/location/latest/developerguide/geofence-tracker-concepts.html"
				}
			]
		},
		{
			label: "API",
			menu: [
				{
					label: "Maps API",
					link: "https://docs.aws.amazon.com/location/latest/APIReference/API_Operations-Maps.html"
				},
				{
					label: "Places API",
					link: "https://docs.aws.amazon.com/location/latest/APIReference/API_Operations-Places.html"
				},
				{
					label: "Routes API",
					link: "https://docs.aws.amazon.com/location/latest/APIReference/API_Operations-Routes.html"
				},
				{
					label: "Geofences API",
					link: "https://docs.aws.amazon.com/location/latest/APIReference/API_Operations-Geofences.html"
				},
				{
					label: "Trackers API",
					link: "https://docs.aws.amazon.com/location/latest/APIReference/API_Operations-Trackers.html"
				}
			]
		},
		{
			label: "Community",
			menu: [
				{
					label: "Contact Us",
					link: "https://aws.amazon.com/contact-us/"
				},
				{
					label: "Connect AWS IQ",
					link: "https://iq.aws.amazon.com/?utm=docs&service=Amazon%20Location%20Service"
				},
				{
					label: "GitHub",
					link: AMAZON_LOCATION_GIT
				},
				{
					label: "AWS re:Post",
					link: "https://repost.aws/tags/TA3QLKBvr1TkCkuNIIqrUBHA/amazon-location-service"
				},
				{
					label: "Stack Overflow",
					link: "https://stackoverflow.com/questions/tagged/amazon-location-service"
				}
			]
		},
		{
			label: "Showcase",
			menu: [
				{
					label: "Web",
					link: SHOWCASE
				},
				{
					label: "iOS",
					link: APPLE_APP_STORE_LINK
				},
				{
					label: "Android",
					link: GOOGLE_PLAY_STORE_LINK
				},
				{
					label: "Help",
					link: HELP
				}
			]
		}
	],
	socials: {
		label: IconPoweredByAws,
		link: "https://aws.amazon.com/",
		icons: [
			{
				label: IconTwitter,
				link: "https://twitter.com/awscloud"
			},
			{
				label: IconYoutube,
				link: "https://www.youtube.com/@amazonwebservices/search?query=%22Amazon%20Location%22"
			},
			{
				label: IconTwitch,
				link: "https://www.twitch.tv/search?term=%22Amazon%20Location%22"
			}
		]
	},
	menuGroupSecondary: {
		label: "Amazon Web Services, Inc. or its affiliates. All rights reserved.",
		menuGroup: [
			{
				label: "Privacy",
				link: "https://aws.amazon.com/privacy/"
			},
			{
				label: "Site Terms",
				link: AWS_TERMS_AND_CONDITIONS
			}
		]
	}
};

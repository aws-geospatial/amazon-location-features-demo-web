/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import {
	EsriDarkGray,
	EsriImagery,
	EsriLight,
	EsriLightGray,
	EsriNavigation,
	EsriStreets,
	HereConrast,
	HereExplore,
	HereExploreTruck,
	HereHybrid,
	HereImagery
} from "@demo/assets";
import { EsriMapEnum, EsriMapStyleEnum, HereMapEnum, HereMapStyleEnum } from "@demo/types";

const appConfig = {
	GLOBAL_CONSTANTS: {
		LOCAL_STORAGE_PREFIX: "amazon-location-web-demo_",
		AMAZON_OFFICE: {
			longitude: -122.3382794774697,
			latitude: 47.615070822950685
		}
	},
	PERSIST_STORAGE_KEYS: {
		AMPLIFY_AUTH_DATA: "AmplifyAuthData",
		AMPLIFY_MAP_DATA: "AmplifyMapData",
		GEO_LOCATION_ALLOWED: "GeoLocationAllowed"
	},
	ROUTES: {
		DEFAULT: "/",
		DEMO: "/demo",
		SHOWCASE: "/showcase",
		OVERVIEW: "/overview",
		PRODUCT: "/product",
		SAMPLES: "/samples",
		SAMPLE_DETAILS: "/sample/:sampleId",
		HELP: "/showcase/help",
		TERMS: "/showcase/terms",
		SOFTWARE_ATTRIBUTIONS: "/showcase/software-attributions",
		BLOG: "/blog",
		NEW: "/new",
		UNAUTHORIZED: "/401",
		FORBIDDEN: "/403",
		NOT_FOUND: "/404",
		ERROR_BOUNDARY: "/error"
	},
	AMAZON_LOCATION_GIT: "https://github.com/aws-geospatial",
	AMAZON_LOCATION_BLOGS: "https://aws.amazon.com/blogs/mobile/category/mobile-services/amazon-location/",
	AMAZON_LOCATION_DEV_GUIDE_SAMPLES: "https://docs.aws.amazon.com/location/latest/developerguide/samples.html",
	AMAZON_LOCATION_NEW:
		"https://aws.amazon.com/about-aws/whats-new/front-end-web-and-mobile/?whats-new-content.sort-by=item.additionalFields.postDateTime&whats-new-content.sort-order=desc&awsf.whats-new-products=general-products%23amazon-location-service&awsm.page-whats-new-content=1",
	AWS_TERMS_AND_CONDITIONS: "/showcase/terms/",
	AMAZON_LOCATION_TERMS_AND_CONDITIONS: "https://aws.amazon.com/service-terms/#82._Amazon_Location_Service",
	AMAZON_LOCATION_DATA_PROVIDERS: "https://aws.amazon.com/location/data-providers/",
	AWS_CUSTOMER_AGREEMENT: "https://aws.amazon.com/agreement/",
	AWS_ACCEPTABLE_USE_POLICY: "https://aws.amazon.com/aup/",
	AWS_PRIVACY_NOTICE: "https://aws.amazon.com/privacy/",
	ESRI_ATTRIBUTION_LINK: "https://www.esri.com/en-us/legal/terms/data-attributions",
	HERE_ATTRIBUTION_LINK: "https://legal.here.com/en-gb/terms/general-content-supplier-terms-and-notices",
	MAP_ITEMS: {
		[EsriMapEnum.ESRI_DARK_GRAY_CANVAS]: {
			style: EsriMapStyleEnum[EsriMapEnum.ESRI_DARK_GRAY_CANVAS]
		},
		[EsriMapEnum.ESRI_IMAGERY]: {
			style: EsriMapStyleEnum[EsriMapEnum.ESRI_IMAGERY]
		},
		[EsriMapEnum.ESRI_LIGHT]: {
			style: EsriMapStyleEnum[EsriMapEnum.ESRI_LIGHT]
		},
		[EsriMapEnum.ESRI_LIGHT_GRAY_CANVAS]: {
			style: EsriMapStyleEnum[EsriMapEnum.ESRI_LIGHT_GRAY_CANVAS]
		},
		[EsriMapEnum.ESRI_NAVIGATION]: {
			style: EsriMapStyleEnum[EsriMapEnum.ESRI_NAVIGATION]
		},
		[EsriMapEnum.ESRI_STREET_MAP]: {
			style: EsriMapStyleEnum[EsriMapEnum.ESRI_STREET_MAP]
		},
		[HereMapEnum.HERE_EXPLORE]: {
			style: HereMapStyleEnum[HereMapEnum.HERE_EXPLORE]
		},
		[HereMapEnum.HERE_CONTRAST]: {
			style: HereMapStyleEnum[HereMapEnum.HERE_CONTRAST]
		},
		[HereMapEnum.HERE_EXPLORE_TRUCK]: {
			style: HereMapStyleEnum[HereMapEnum.HERE_EXPLORE_TRUCK]
		},
		[HereMapEnum.HERE_HYBRID]: {
			style: HereMapStyleEnum[HereMapEnum.HERE_HYBRID]
		},
		[HereMapEnum.HERE_IMAGERY]: {
			style: HereMapStyleEnum[HereMapEnum.HERE_IMAGERY]
		}
	},
	PLACE_INDEXES: {
		ESRI: "location.aws.com.demo.places.Esri.PlaceIndex",
		HERE: "location.aws.com.demo.places.HERE.PlaceIndex"
	},
	ROUTE_CALCULATORS: {
		ESRI: "location.aws.com.demo.routes.Esri.RouteCalculator",
		HERE: "location.aws.com.demo.routes.HERE.RouteCalculator"
	},
	GEOFENCE_COLLECTION: "location.aws.com.demo.geofences.GeofenceCollection",
	DEVICE_ID_WEB: "web_browser_device",
	TRACKER: "location.aws.com.demo.trackers.Tracker",
	CF_TEMPLATE: import.meta.env.VITE_AWS_CF_TEMPLATE,
	APPLE_APP_STORE_LINK: import.meta.env.VITE_APPLE_APP_STORE_LINK,
	GOOGLE_PLAY_STORE_LINK: import.meta.env.VITE_GOOGLE_PLAY_STORE_LINK,
	ESRI_STYLES: [
		{ id: EsriMapEnum.ESRI_LIGHT, image: EsriLight, name: "Light" },
		{ id: EsriMapEnum.ESRI_STREET_MAP, image: EsriStreets, name: "Streets" },
		{ id: EsriMapEnum.ESRI_NAVIGATION, image: EsriNavigation, name: "Navigation" },
		{ id: EsriMapEnum.ESRI_DARK_GRAY_CANVAS, image: EsriDarkGray, name: "Dark Gray" },
		{ id: EsriMapEnum.ESRI_LIGHT_GRAY_CANVAS, image: EsriLightGray, name: "Light Gray" },
		{ id: EsriMapEnum.ESRI_IMAGERY, image: EsriImagery, name: "Imagery" }
	],
	HERE_STYLES: [
		{ id: HereMapEnum.HERE_EXPLORE, image: HereExplore, name: "Explore" },
		{ id: HereMapEnum.HERE_CONTRAST, image: HereConrast, name: "Contrast" },
		{ id: HereMapEnum.HERE_EXPLORE_TRUCK, image: HereExploreTruck, name: "Explore Truck" },
		{ id: HereMapEnum.HERE_HYBRID, image: HereHybrid, name: "Hybrid" },
		{ id: HereMapEnum.HERE_IMAGERY, image: HereImagery, name: "Imagery" }
	]
};

export default appConfig;

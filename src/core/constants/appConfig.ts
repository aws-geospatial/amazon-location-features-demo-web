/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Hybrid, Monochrome, Satellite, Standard } from "@demo/assets/pngs";
import { MapColorSchemeEnum, MapStyleEnum } from "@demo/types/Enums";

const getEnv = (key: string) => {
	return import.meta.env[key];
};

const appConfig = {
	API_KEYS: (getEnv("VITE_AWS_API_KEYS") || "")
		.split(",")
		.reduce((result: { [key: string]: string }, apiKey: string, idx: number) => {
			const regions = (getEnv("VITE_AWS_API_KEY_REGIONS") || "").split(",");
			const region = regions[idx].trim();
			result[region] = apiKey.trim();

			return result;
		}, {}) as { [key: string]: string },
	IDENTITY_POOL_IDS: (getEnv("VITE_AWS_COGNITO_IDENTITY_POOL_IDS") || "")
		.split(",")
		.reduce((result: { [key: string]: string }, value: string) => {
			const poolId = value.trim();
			const region = poolId.split(":")[0];
			result[region] = poolId;

			return result;
		}, {}) as { [key: string]: string },
	WEB_SOCKET_URLS: (getEnv("VITE_AWS_WEB_SOCKET_URLS") || "")
		.split(",")
		.reduce((result: { [key: string]: string }, value: string) => {
			const webSocketUrl = value.trim();
			const region = webSocketUrl.split(".")[2];
			result[region] = webSocketUrl;

			return result;
		}, {}) as { [key: string]: string },
	ENV: {
		PINPOINT_IDENTITY_POOL_ID: getEnv("VITE_PINPOINT_IDENTITY_POOL_ID"),
		PINPOINT_APPLICATION_ID: getEnv("VITE_PINPOINT_APPLICATION_ID"),
		CF_TEMPLATE: getEnv("VITE_AWS_CF_TEMPLATE"),
		APPLE_APP_STORE_LINK: getEnv("VITE_APPLE_APP_STORE_LINK"),
		GOOGLE_PLAY_STORE_LINK: getEnv("VITE_GOOGLE_PLAY_STORE_LINK"),
		COUNTRY_EVALUATION_URL: "/doNotDelete.txt",
		APP_VERSION: getEnv("VITE_APP_VERSION"),
		NL_BASE_URL: getEnv("VITE_NL_BASE_URL"),
		NL_API_KEY: getEnv("VITE_NL_API_KEY"),
		MIGRATE_FROM_GOOGLE_MAPS_PAGE: !!parseInt(String(getEnv("VITE_MIGRATE_FROM_GOOGLE_MAPS_PAGE"))),
		MIGRATE_A_WEB_APP_PAGE: !!parseInt(String(getEnv("VITE_MIGRATE_A_WEB_APP_PAGE"))),
		MIGRATE_AN_ANDROID_APP_PAGE: !!parseInt(String(getEnv("VITE_MIGRATE_AN_ANDROID_APP_PAGE"))),
		MIGRATE_AN_IOS_APP_PAGE: !!parseInt(String(getEnv("VITE_MIGRATE_AN_IOS_APP_PAGE"))),
		MIGRATE_A_WEB_SERVICE_PAGE: !!parseInt(String(getEnv("VITE_MIGRATE_A_WEB_SERVICE_PAGE"))),
		PRICING_PAGE: !!parseInt(String(getEnv("VITE_PRICING_PAGE"))),
		SHOW_NEW_NAVIGATION: !!parseInt(String(getEnv("VITE_SHOW_NEW_NAVIGATION")))
	},
	PERSIST_STORAGE_KEYS: {
		LOCAL_STORAGE_PREFIX: "amazon-location_",
		AUTH_DATA: "authData",
		MAP_DATA: "mapData",
		PERSISTED_DATA: "persistedData",
		GEO_LOCATION_ALLOWED: "geoLocationAllowed",
		SHOULD_CLEAR_CREDENTIALS: "shouldClearCredentials",
		ANALYTICS_ENDPOINT_ID: "analyticsEndpointId",
		ANALYTICS_CREDS: "analyticsCreds",
		PAGE_VIEW_IDENTIFIERS: "pageViewIdentifiers",
		FASTEST_REGION: "fastestRegion",
		LOCAL_APP_VERSION: "localAppVersion"
	},
	ROUTES: {
		DEFAULT: "/",
		DEMO: "/demo",
		NL_DEMO: "/demo?dp=Esri&nl=true",
		NOT_FOUND: "/404",
		ERROR_BOUNDARY: "/error",
		SAMPLES: "/samples",
		SAMPLE_DETAILS: "/sample/:sampleId",
		HELP: "/demo/help",
		TERMS: "/demo/terms",
		SOFTWARE_ATTRIBUTIONS: "/demo/software-attributions",
		MIGRATE_FROM_GOOGLE_MAPS: "/migrate-from-google-maps",
		MIGRATE_A_WEB_APP: "/migrate-a-web-app",
		MIGRATE_AN_ANDROID_APP: "/migrate-an-android-app",
		MIGRATE_AN_IOS_APP: "/migrate-an-ios-app",
		MIGRATE_A_WEB_SERVICE: "/migrate-a-web-service",
		PRICING: "/pricing"
	},
	GET_PARAMS: {
		NL_TOGGLE: "nl"
	},
	MAP_RESOURCES: {
		IMPERIAL_COUNTRIES: ["US", "GB", "LR", "MM"],
		AMAZON_HQ: {
			US: { longitude: -122.3408586, latitude: 47.6149975 }
		},
		MAX_BOUNDS: {
			DEFAULT: [-210, -80, 290, 85],
			VANCOUVER: {
				DESKTOP: [
					[-123.185777, 49.258543], // southwest corner
					[-123.061047, 49.303531] // northeast corner
				],
				TABLET: [
					[-123.196983, 49.234978], // southwest corner
					[-123.040067, 49.317798] // northeast corner
				],
				MOBILE: [
					[-123.209922, 49.192026], // southwest corner
					[-123.037722, 49.347977] // northeast corner
				]
			}
		},
		MAP_STYLES: [
			{ id: MapStyleEnum.STANDARD.toLowerCase(), name: MapStyleEnum.STANDARD, image: Standard },
			{ id: MapStyleEnum.MONOCHROME.toLowerCase(), name: MapStyleEnum.MONOCHROME, image: Monochrome },
			{ id: MapStyleEnum.HYBRID.toLowerCase(), name: MapStyleEnum.HYBRID, image: Hybrid },
			{ id: MapStyleEnum.SATELLITE.toLowerCase(), name: MapStyleEnum.SATELLITE, image: Satellite }
		],
		MAP_COLOR_SCHEMES: [
			{ id: MapColorSchemeEnum.LIGHT.toLowerCase(), name: MapColorSchemeEnum.LIGHT },
			{ id: MapColorSchemeEnum.DARK.toLowerCase(), name: MapColorSchemeEnum.DARK }
		],
		MAP_POLITICAL_VIEWS: {
			AR: "Argentina's view on the Southern Patagonian Ice Field and Tierra Del Fuego, including the Falkland Islands, South Georgia, and South Sandwich Islands",
			EG: "Egypt's view on Bir Tawil",
			IN: "India's view on Gilgit-Baltistan",
			KE: "Kenya's view on the Ilemi Triangle",
			MA: "Morocco's view on Western Sahara",
			RU: "Russia's view on Crimea",
			SD: "Sudan's view on the Halaib Triangle",
			RS: "Serbia's view on Kosovo, Vukovar, and Sarengrad Islands",
			SR: "Suriname's view on the Courantyne Headwaters and Lawa Headwaters",
			SY: "Syria's view on the Golan Heights",
			TR: "Turkey's view on Cyprus and Northern Cyprus",
			TZ: "Tanzania's view on Lake Malawi",
			UY: "Uruguay's view on Rincon de Artigas",
			VN: "Vietnam's view on the Paracel Islands and Spratly Islands"
		},
		GEOFENCE_COLLECTION: "location.aws.com.demo.geofences.GeofenceCollection",
		DEVICE_ID_WEB: "web_browser_device",
		TRACKER: "location.aws.com.demo.trackers.Tracker",
		SEARCH_ROUTE_BOUND_OPTIONS: {
			DESKTOP: {
				padding: {
					top: 200,
					bottom: 200,
					left: 450,
					right: 200
				},
				speed: 5,
				linear: true
			},
			TABLET: {
				padding: {
					top: 100,
					bottom: 100,
					left: 400,
					right: 100
				},
				speed: 5,
				linear: true
			},
			MOBILE: {
				padding: {
					top: 100,
					bottom: 400,
					left: 100,
					right: 100
				},
				speed: 5,
				linear: true
			}
		}
	},
	LINKS: {
		AMAZON_LOCATION_GIT: "https://github.com/aws-geospatial",
		AMAZON_LOCATION_BLOGS: "https://aws.amazon.com/blogs/mobile/category/mobile-services/amazon-location/",
		AMAZON_LOCATION_DEV_GUIDE_SAMPLES: "https://docs.aws.amazon.com/location/latest/developerguide/samples.html",
		AMAZON_LOCATION_NEW:
			"https://aws.amazon.com/about-aws/whats-new/front-end-web-and-mobile/?whats-new-content.sort-by=item.additionalFields.postDateTime&whats-new-content.sort-order=desc&awsf.whats-new-products=general-products%23amazon-location-service&awsm.page-whats-new-content=1",
		AWS_TERMS_AND_CONDITIONS: "/demo/terms/",
		AMAZON_LOCATION_TERMS_AND_CONDITIONS: "https://aws.amazon.com/service-terms/#82._Amazon_Location_Service",
		AMAZON_LOCATION_DATA_PROVIDERS: "https://aws.amazon.com/location/data-providers/",
		AWS_CUSTOMER_AGREEMENT: "https://aws.amazon.com/agreement/",
		AWS_ACCEPTABLE_USE_POLICY: "https://aws.amazon.com/aup/",
		AWS_PRIVACY_NOTICE: "https://aws.amazon.com/privacy/",
		ESRI_ATTRIBUTION_LINK: "https://www.esri.com/en-us/legal/terms/data-attributions",
		HERE_ATTRIBUTION_LINK: "https://legal.here.com/en-gb/terms/general-content-supplier-terms-and-notices",
		GRAB_DEVELOPER_GUIDE: "https://docs.aws.amazon.com/location/latest/developerguide/grab.html",
		LEARN_MORE_URL: "https://aws.amazon.com/location/?trk=b1ff9204-1ee6-4d04-9cd7-812e06d51e72&sc_channel=el",
		DEVELOPER_GUIDE_URL:
			"https://docs.aws.amazon.com/location/latest/developerguide/welcome.html?trk=67d34d8b-8ad3-4125-a65f-892564657dc4&sc_channel=el",
		CONSOLE_URL:
			"https://console.aws.amazon.com/location/home?nc2=h_ct&src=location.aws.com-signin&trk=40b56f71-8696-41ee-9745-731eab90fee8&sc_channel=el",
		LEARN_MAPS_URL:
			"https://docs.aws.amazon.com/location/latest/developerguide/map-concepts.html?trk=5ec46857-62ef-490c-b300-312f3232a3f2&sc_channel=el",
		LEARN_PLACES_URL:
			"https://docs.aws.amazon.com/location/latest/developerguide/places-concepts.html?trk=9fca7120-d68b-4a37-9796-376ddff93112&sc_channel=el",
		LEARN_ROUTES_URL:
			"https://docs.aws.amazon.com/location/latest/developerguide/route-concepts.html?trk=39f77bb8-13c6-48fd-873f-15e3762304a6&sc_channel=el",
		LEARN_GEOFENCES_URL:
			"https://docs.aws.amazon.com/location/latest/developerguide/geofence-tracker-concepts.html?trk=7f30cc2d-283d-4be7-acae-eece3c2402f3&sc_channel=el",
		LEARN_TRACKERS_URL:
			"https://docs.aws.amazon.com/location/latest/developerguide/geofence-tracker-concepts.html?trk=7f30cc2d-283d-4be7-acae-eece3c2402f3&sc_channel=el",
		AWS_GETTING_STARTED_URL:
			"https://aws.amazon.com/location/getting-started/?trk=62cbda11-92dc-4aee-9a53-23befa82aaf3&sc_channel=el",
		AWS_FAQ_URL: "https://aws.amazon.com/location/faqs/?trk=facff0d6-d5ee-4a47-be74-006c8c1bedfc&sc_channel=el",
		AWS_PRICING_URL: "https://aws.amazon.com/location/pricing/?trk=ca946f21-94e1-400e-820e-c59227469836&sc_channel=el",
		AWS_WORKSHOP_URL:
			"https://catalog.workshops.aws/amazon-location-101/en-US?trk=15f09edb-8ab2-4645-9f9c-30f9e53afc8f&sc_channel=el",
		AWS_MAPS_API_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_Operations-Maps.html?trk=294f115e-c817-4d1a-8e51-e269fb79692b&sc_channel=el",
		AWS_PLACES_API_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_Operations-Places.html?trk=9fa9fa0b-8431-45c1-80c4-92ae7850ced3&sc_channel=el",
		AWS_ROUTES_API_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_Operations-Routes.html?trk=60151c30-2d15-47e6-a0c0-17a557761b60&sc_channel=el",
		AWS_GEOFENCES_API_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_Operations-Geofences.html?trk=2c28d9c8-e83a-4f7b-9c97-58d6f589bdb6&sc_channel=el",
		AWS_TRACKERS_API_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_Operations-Trackers.html?trk=3567840b-c12f-4f60-b1c6-7cdad9794d6c&sc_channel=el",
		AWS_CONTACT_US_URL: "https://aws.amazon.com/contact-us/?trk=a500323b-ad80-4622-ab11-c920bfde8948&sc_channel=el",
		CONNECT_AWS_IQ_URL:
			"https://iq.aws.amazon.com/?utm=docs&service=Amazon+Location+Service&trk=21d6523f-f7f1-4c67-b89c-678e12a6bccf&sc_channel=el",
		AWS_REPOST_URL:
			"https://repost.aws/tags/TA3QLKBvr1TkCkuNIIqrUBHA/amazon-location-service?trk=d9baa9e4-1776-474d-b50b-a9a8bd95f21f&sc_channel=el",
		AWS_STACKOVERFLOW_URL:
			"https://stackoverflow.com/questions/tagged/amazon-location-service?trk=da4b9cb6-eee9-40cd-a4c9-e0a19eaacccd&sc_channel=el",
		AWS_HOME_URL: "https://aws.amazon.com/",
		AWS_TWITTER_URL: "https://twitter.com/awscloud",
		AWS_YOUTUBE_URL: "https://www.youtube.com/@amazonwebservices/search?query=%22Amazon%20Location%22",
		AWS_TWITCH_URL: "https://www.twitch.tv/search?term=%22Amazon%20Location%22",
		AWS_PRIVACY_URL: "https://aws.amazon.com/privacy/",
		OVERVIEW_PRICING_URL: "https://aws.amazon.com/location/pricing/?loc=ft#Pricing_examples",
		OVERVIEW_PRIVACY_URL: "https://aws.amazon.com/location/features/#Data_Security_and_Control",
		OVERVIEW_INTEGRATIONS_URL: "https://aws.amazon.com/location/features/#Management_and_Developer_Tools",
		SEARCH_PLACE_INDEX_FOR_TEXT_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_SearchPlaceIndexForText.html",
		SEARCH_PLACE_INDEX_FOR_POSITION_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_SearchPlaceIndexForPosition.html",
		SEARCH_PLACE_INDEX_FOR_SUGGESTIONS_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_SearchPlaceIndexForSuggestions.html",
		GET_PLACE_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_GetPlace.html",
		GET_MAP_GLYPHS_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_GetMapGlyphs.html",
		GET_MAP_SPRITES_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_GetMapSprites.html",
		GET_MAP_STYLE_DESCRIPTOR_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_GetMapStyleDescriptor.html",
		GET_MAP_TILE_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_GetMapTile.html",
		CALCULATE_ROUTE_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_CalculateRoute.html",
		CALCULATE_ROUTE_MATRIX_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_CalculateRouteMatrix.html",
		CREATE_GEOFENCE_COLLECTION_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_CreateGeofenceCollection.html",
		UPDATE_GEOFENCE_COLLECTION_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_UpdateGeofenceCollection.html",
		DELETE_GEOFENCE_COLLECTION_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_DeleteGeofenceCollection.html",
		DESCRIBE_GEOFENCE_COLLECTION_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_DescribeGeofenceCollection.html",
		PUT_GEOFENCE_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_PutGeofence.html",
		GET_GEOFENCE_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_GetGeofence.html",
		LIST_GEOFENCES_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_ListGeofences.html",
		BATCH_PUT_GEOFENCE_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_BatchPutGeofence.html",
		BATCH_DELETE_GEOFENCE_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_BatchDeleteGeofence.html",
		BATCH_EVALUATE_GEOFENCES_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_BatchEvaluateGeofences.html",
		CREATE_TRACKER_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_CreateTracker.html",
		DESCRIBE_TRACKER_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_DescribeTracker.html",
		UPDATE_TRACKER_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_UpdateTracker.html",
		DELETE_TRACKER_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_DeleteTracker.html",
		LIST_TRACKERS_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_ListTrackers.html",
		ASSOCIATE_TRACKER_CONSUMER_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_AssociateTrackerConsumer.html",
		DISASSOCIATE_TRACKER_CONSUMER_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_DisassociateTrackerConsumer.html",
		LIST_TRACKER_CONSUMERS_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_ListTrackerConsumers.html",
		GET_DEVICE_POSITION_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_GetDevicePosition.html",
		BATCH_GET_DEVICE_POSITION_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_BatchGetDevicePosition.html",
		BATCH_UPDATE_DEVICE_POSITION_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_BatchUpdateDevicePosition.html",
		LIST_DEVICE_POSITIONS_URL: "https://docs.aws.amazon.com/location/latest/APIReference/API_ListDevicePositions.html",
		GET_DEVICE_POSITION_HISTORY_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_GetDevicePositionHistory.html",
		BATCH_DELETE_DEVICE_POSITION_HISTORY_URL:
			"https://docs.aws.amazon.com/location/latest/APIReference/API_BatchDeleteDevicePositionHistory.html",
		AWS_LOCATION: "https://aws.amazon.com/location/",
		AWS_LOCATION_MAPS_URL: "https://aws.amazon.com/location/maps/",
		AWS_LOCATION_PLACES_URL: "https://aws.amazon.com/location/places/",
		AWS_LOCATION_ROUTES_URL: "https://aws.amazon.com/location/routes/",
		AWS_LOCATION_GENFENCE_AND_TRACKERS_URL: "https://aws.amazon.com/location/geofences-and-trackers/",
		AWS_LOCATION_INDUSTRY_URL: "https://aws.amazon.com/location/industry/",
		AWS_LOCATION_TRANSPORTATION_AND_LOGISTICS_URL:
			"https://aws.amazon.com/location/industry/transportation-and-logistics/",
		AWS_LOCATION_FINANCIAL_SERVICE_URL: "https://aws.amazon.com/location/industry/financial-service/",
		AWS_LOCATION_HEALTHCARE_URL: "https://aws.amazon.com/location/industry/healthcare/",
		AWS_LOCATION_RETAILS_URL: "https://aws.amazon.com/location/industry/retail/",
		AWS_LOCATION_TRAVEL_AND_HOSPITALITY_URL: "https://aws.amazon.com/location/industry/travel-and-hospitality/",
		AWS_LOCATION_REAL_ESTATE_URL: "https://aws.amazon.com/location/real-estate/",
		AWS_LOCATION_RESOURCES_URL: "https://aws.amazon.com/location/resources/",
		AWS_LOCATION_CUSTOMERS_URL: "https://aws.amazon.com/location/resources/customers/",
		AWS_LOCATION_PRODUCT_RESOURCES_URL: "https://aws.amazon.com/location/resources/product-resources/",
		AWS_LOCATION_DEVELOPER_RESOURCES_URL: "https://aws.amazon.com/location/resources/developer-resources/",
		AMAZON_LOCATION_AUTH_SDK_IOS_URL: "https://github.com/aws-geospatial/amazon-location-mobile-auth-sdk-ios",
		AMAZON_LOCATION_DOCUMENTATION_URL: "https://docs.aws.amazon.com/location/"
	}
};

export default appConfig;

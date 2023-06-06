// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { faker } from "@faker-js/faker";

jest.mock("@demo/core/constants/appConfig", () => ({
	ENV: {
		IDENTITY_POOL_ID: "",
		REGION: "",
		IDENTITY_POOL_ID_ASIA: "",
		REGION_ASIA: "",
		CF_TEMPLATE: "",
		APPLE_APP_STORE_LINK: "",
		GOOGLE_PLAY_STORE_LINK: ""
	},
	PERSIST_STORAGE_KEYS: {
		LOCAL_STORAGE_PREFIX: "amazon-location-web-demo_",
		AMPLIFY_AUTH_DATA: "AmplifyAuthData",
		AMPLIFY_MAP_DATA: "AmplifyMapData",
		PERSISTED_DATA: "PersistedData",
		GEO_LOCATION_ALLOWED: "GeoLocationAllowed",
		SHOULD_CLEAR_CREDENTIALS: "ShouldClearCredentials"
	},
	ROUTES: {
		DEFAULT: "/",
		DEMO: "/demo",
		OVERVIEW: "/overview",
		PRODUCT: "/product",
		SAMPLES: "/samples",
		SAMPLE_DETAILS: "/sample/:sampleId",
		HELP: "/demo/help",
		TERMS: "/demo/terms",
		SOFTWARE_ATTRIBUTIONS: "/showcase/software-attributions",
		BLOG: "/blog",
		NEW: "/new",
		UNAUTHORIZED: "/401",
		FORBIDDEN: "/403",
		NOT_FOUND: "/404",
		ERROR_BOUNDARY: "/error"
	},
	MAP_RESOURCES: {
		IMPERIAL_COUNTRIES: ["US", "GB", "LR", "MM"],
		GRAB_SUPPORTED_AWS_REGIONS: ["ap-southeast-1"],
		AMAZON_HQ: {
			US: { longitude: -122.3408586, latitude: 47.6149975 },
			SG: { longitude: 103.8461793, latitude: 1.2840177 }
		},
		MAX_BOUNDS: {
			DEFAULT: [-210, -80, 290, 85],
			GRAB: [90.0, -21.943045533438166, 146.25, 31.952162238024968]
		},
		// MAP_ITEMS: {
		// 	[EsriMapEnum.ESRI_DARK_GRAY_CANVAS]: {
		// 		style: EsriMapStyleEnum[EsriMapEnum.ESRI_DARK_GRAY_CANVAS]
		// 	},
		// 	[EsriMapEnum.ESRI_IMAGERY]: {
		// 		style: EsriMapStyleEnum[EsriMapEnum.ESRI_IMAGERY]
		// 	},
		// 	[EsriMapEnum.ESRI_LIGHT]: {
		// 		style: EsriMapStyleEnum[EsriMapEnum.ESRI_LIGHT]
		// 	},
		// 	[EsriMapEnum.ESRI_LIGHT_GRAY_CANVAS]: {
		// 		style: EsriMapStyleEnum[EsriMapEnum.ESRI_LIGHT_GRAY_CANVAS]
		// 	},
		// 	[EsriMapEnum.ESRI_NAVIGATION]: {
		// 		style: EsriMapStyleEnum[EsriMapEnum.ESRI_NAVIGATION]
		// 	},
		// 	[EsriMapEnum.ESRI_STREET_MAP]: {
		// 		style: EsriMapStyleEnum[EsriMapEnum.ESRI_STREET_MAP]
		// 	},
		// 	[HereMapEnum.HERE_EXPLORE]: {
		// 		style: HereMapStyleEnum[HereMapEnum.HERE_EXPLORE]
		// 	},
		// 	[HereMapEnum.HERE_CONTRAST]: {
		// 		style: HereMapStyleEnum[HereMapEnum.HERE_CONTRAST]
		// 	},
		// 	[HereMapEnum.HERE_EXPLORE_TRUCK]: {
		// 		style: HereMapStyleEnum[HereMapEnum.HERE_EXPLORE_TRUCK]
		// 	},
		// 	[HereMapEnum.HERE_HYBRID]: {
		// 		style: HereMapStyleEnum[HereMapEnum.HERE_HYBRID]
		// 	},
		// 	[HereMapEnum.HERE_IMAGERY]: {
		// 		style: HereMapStyleEnum[HereMapEnum.HERE_IMAGERY]
		// 	},
		// 	[GrabMapEnum.GRAB_STANDARD_LIGHT]: {
		// 		style: GrabMapStyleEnum[GrabMapEnum.GRAB_STANDARD_LIGHT]
		// 	},
		// 	[GrabMapEnum.GRAB_STANDARD_DARK]: {
		// 		style: GrabMapStyleEnum[GrabMapEnum.GRAB_STANDARD_DARK]
		// 	}
		// },
		MAP_STYLES: {
			ESRI_STYLES: [
				{ id: "location.aws.com.demo.maps.Esri.Light", image: "", name: "Light" },
				{ id: "location.aws.com.demo.maps.Esri.Streets", image: "", name: "Streets" },
				{ id: "location.aws.com.demo.maps.Esri.Navigation", image: "", name: "Navigation" },
				{ id: "location.aws.com.demo.maps.Esri.DarkGrayCanvas", image: "", name: "Dark Gray" },
				{ id: "location.aws.com.demo.maps.Esri.LightGrayCanvas", image: "", name: "Light Gray" },
				{ id: "location.aws.com.demo.maps.Esri.Imagery", image: "", name: "Imagery" }
			],
			HERE_STYLES: [
				{ id: "location.aws.com.demo.maps.HERE.Explore", image: "", name: "Explore" },
				{ id: "location.aws.com.demo.maps.HERE.Contrast", image: "", name: "Contrast" },
				{ id: "location.aws.com.demo.maps.HERE.ExploreTruck", image: "", name: "Explore Truck" },
				{ id: "location.aws.com.demo.maps.HERE.Hybrid", image: "", name: "Hybrid" },
				{ id: "location.aws.com.demo.maps.HERE.Imagery", image: "", name: "Imagery" }
			],
			GRAB_STYLES: [
				{ id: "location.aws.com.demo.maps.Grab.StandardLight", image: "", name: "Light" },
				{ id: "location.aws.com.demo.maps.Grab.StandardDark", image: "", name: "Dark" }
			]
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
		TRACKER: "location.aws.com.demo.trackers.Tracker"
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
		HERE_ATTRIBUTION_LINK: "https://legal.here.com/en-gb/terms/general-content-supplier-terms-and-notices"
	}
}));

if (typeof navigator?.clipboard?.writeText === "undefined") {
	Object.assign(navigator, { clipboard: { writeText: jest.fn() } });
}

if (typeof window.URL.createObjectURL === "undefined") {
	window.URL.createObjectURL = jest.fn();
}

if (typeof window?.crypto?.randomUUID === "undefined") {
	Object.assign(window, { crypto: { randomUUID: faker.datatype.uuid } });
}

if (typeof window?.matchMedia === "undefined") {
	Object.assign(window, {
		matchMedia: () => ({
			matches: true,
			addEventListener: jest.fn(),
			removeEventListener: jest.fn()
		})
	});
}

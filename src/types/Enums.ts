/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export enum TravelMode {
	CAR = "Car",
	WALKING = "Walking",
	TRUCK = "Truck"
}

export enum InputType {
	FROM = "from",
	TO = "to"
}

export enum DistanceUnit {
	KILOMETERS = "Kilometers",
	MILES = "Miles"
}

export enum LocationErrorMessage {
	DENIED = "Permission denied, please enable browser location and refresh the page",
	UNAVAILABLE = "Permission unavailable, please check that your location services are enabled.",
	TIMEOUT = "Timeout, please try again"
}

export enum ToastType {
	INFO = "info",
	SUCCESS = "success",
	WARNING = "warning",
	ERROR = "error"
}

export enum MapProviderEnum {
	ESRI = "Esri",
	HERE = "HERE"
}

export enum EsriMapEnum {
	ESRI_DARK_GRAY_CANVAS = "location.aws.com.demo.maps.Esri.DarkGrayCanvas",
	ESRI_IMAGERY = "location.aws.com.demo.maps.Esri.Imagery",
	ESRI_LIGHT = "location.aws.com.demo.maps.Esri.Light",
	ESRI_LIGHT_GRAY_CANVAS = "location.aws.com.demo.maps.Esri.LightGrayCanvas",
	ESRI_NAVIGATION = "location.aws.com.demo.maps.Esri.Navigation",
	ESRI_STREET_MAP = "location.aws.com.demo.maps.Esri.Streets"
}

export enum EsriMapStyleEnum {
	"location.aws.com.demo.maps.Esri.DarkGrayCanvas" = "VectorEsriDarkGrayCanvas",
	"location.aws.com.demo.maps.Esri.Imagery" = "RasterEsriImagery",
	"location.aws.com.demo.maps.Esri.Light" = "VectorEsriTopographic",
	"location.aws.com.demo.maps.Esri.LightGrayCanvas" = "VectorEsriLightGrayCanvas",
	"location.aws.com.demo.maps.Esri.Navigation" = "VectorEsriNavigation",
	"location.aws.com.demo.maps.Esri.Streets" = "VectorEsriStreets"
}

export enum HereMapEnum {
	HERE_EXPLORE = "location.aws.com.demo.maps.HERE.Explore",
	HERE_CONTRAST = "location.aws.com.demo.maps.HERE.Contrast",
	HERE_EXPLORE_TRUCK = "location.aws.com.demo.maps.HERE.ExploreTruck",
	HERE_HYBRID = "location.aws.com.demo.maps.HERE.Hybrid",
	HERE_IMAGERY = "location.aws.com.demo.maps.HERE.Imagery"
}

export enum HereMapStyleEnum {
	"location.aws.com.demo.maps.HERE.Explore" = "VectorHereExplore",
	"location.aws.com.demo.maps.HERE.Contrast" = "VectorHereContrast",
	"location.aws.com.demo.maps.HERE.ExploreTruck" = "VectorHereExploreTruck",
	"location.aws.com.demo.maps.HERE.Hybrid" = "HybridHereExploreSatellite",
	"location.aws.com.demo.maps.HERE.Imagery" = "RasterHereExploreSatellite"
}

export enum CirclreDrawTypeEnum {
	DRAW_CREATE = "draw.create",
	DRAW_UPDATE = "draw.update"
}

export enum SettingOptionEnum {
	UNITS = "Units",
	DATA_PROVIDER = "Data provider",
	MAP_STYLE = "Map style",
	ROUTE_OPTIONS = "Default route options",
	AWS_CLOUD_FORMATION = "Connect AWS Account"
}

export enum MoreOptionEnum {
	ATTRIBUTION = "Attribution",
	LEGAL_AND_PRIVACY = "Legal and Privacy",
	ABOUT = "About",
	TERMS_AND_CONDITIONS = "Terms and Conditions"
}

export enum RadiusInM {
	DEFAULT = 80,
	MIN = 10,
	MAX = 10000
}

export enum TrackerType {
	CAR = "Car",
	WALK = "Walk",
	DRONE = "Drone"
}

export enum HelpAccordionEnum {
	CREATE = "Creation",
	DELETE = "Deletion",
	TROUBLESHOOT = "Troubleshooting"
}
